// Sembrador idempotente del MUNDO (migración 0030). Rellena, a partir de los
// datos existentes (band/order_index/icon/title), las columnas decorativas/de
// ruta derivadas de la biblia Minecraft:
//   · levels: biome_key, world_order, map_color, danger, theme_key
//   · units : structure_key, kind ('keystone' = última unidad del bioma)
//
// La derivación REPLICA src/lib/minecraft/{biomes,structures}.ts (estos son .ts y
// no se pueden importar desde un script .mjs sin loader). Mantener ambas en sync.
//
// NO destructivo: usa COALESCE(columna, derivado) para las columnas "blandas"
// (biome_key/map_color/world_order/danger/theme_key/structure_key) => preserva
// overrides manuales y re-ejecutar es seguro. `kind` se marca 'keystone' en la
// última unidad de cada bioma y 'standard' en el resto (determinista).
//
// Patrón de conexión idéntico a scripts/db/migrate.mjs (carga .env.local).
//
// Uso:
//   node scripts/db/seed-world-map.mjs            -> aplica el seed
//   node scripts/db/seed-world-map.mjs --dry-run  -> imprime el plan sin escribir
import pg from 'pg';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');

// Carga .env.local sin pisar variables ya presentes (igual que migrate.mjs).
function loadEnv() {
  try {
    const txt = readFileSync(join(repoRoot, '.env.local'), 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  } catch { /* sin .env.local */ }
}
loadEnv();

const url = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!url) { console.error('ERROR: falta SUPABASE_DB_URL en .env.local'); process.exit(1); }

const dryRun = process.argv.includes('--dry-run');

// ── Espejo de src/lib/minecraft/biomes.ts (banda 1–8 → bioma propio) ──────────
const BIOMES = {
  1: { key: 'pradera', mapColor: '#7fc24a', danger: 0 },
  2: { key: 'bosque', mapColor: '#3f8f3a', danger: 0 },
  3: { key: 'ribera', mapColor: '#c7a86b', danger: 1 },
  4: { key: 'colinas', mapColor: '#6f9b57', danger: 1 },
  5: { key: 'cuevas', mapColor: '#5b6e8c', danger: 2 },
  6: { key: 'puerto', mapColor: '#4a90b8', danger: 2 },
  7: { key: 'tundra', mapColor: '#a9c6d6', danger: 3 },
  8: { key: 'portal', mapColor: '#8c2f2f', danger: 3 },
};
function clampBand(band) {
  const n = Number(band);
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(8, Math.round(n)));
}
function biomeForBand(band) { return BIOMES[clampBand(band)]; }
// El bioma 8 (Portal · Nether) usa el tema 'nether'; el resto 'overworld'.
function themeForBand(band) { return clampBand(band) >= 8 ? 'nether' : 'overworld'; }

// ── Espejo de src/lib/minecraft/structures.ts (icono/título → estructura) ─────
const ICON_TO_STRUCTURE = {
  Hand: 'casa', Palette: 'casa', Hash: 'mina', Box: 'casa', Activity: 'granja',
  MapPin: 'faro', User: 'casa', Search: 'mina', PlusCircle: 'granja',
  MessageCircle: 'mercado', HelpCircle: 'pozo', Clock: 'torre', Heart: 'casa',
  ArrowRightLeft: 'mercado', Compass: 'faro', ShoppingBag: 'mercado', History: 'torre',
  AlertCircle: 'torre', Info: 'pozo', Navigation: 'faro', Calendar: 'torre',
  MessageSquare: 'mercado', ShoppingBasket: 'mercado', BookOpen: 'pozo', Gamepad: 'casa',
  CheckCircle: 'granja', Lightbulb: 'torre', FileText: 'pozo', Users: 'mercado',
  TrendingUp: 'torre', Flag: 'faro', Rocket: 'portal', Brain: 'pozo', Zap: 'mina',
  Star: 'faro', Trophy: 'portal',
  // Alias de nombres lucide nuevos (sync con src/lib/minecraft/structures.ts).
  CirclePlus: 'granja', CircleQuestionMark: 'pozo', CircleHelp: 'pozo',
  CircleAlert: 'torre', CircleCheck: 'granja', MessageCircleQuestion: 'mercado',
  MessagesSquare: 'mercado', Map: 'faro', MapPinned: 'faro',
};
const TITLE_KEYWORDS = [
  [/granj|farm|cosech|comida|food|animal/i, 'granja'],
  [/mina|mine|cueva|cave|mineral|excav/i, 'mina'],
  [/pozo|well|agua|water|fuente/i, 'pozo'],
  [/torre|tower|reloj|tiempo|time/i, 'torre'],
  [/faro|light|guía|guia|mapa|map|brúj|bruj|navega/i, 'faro'],
  [/mercad|market|tienda|shop|trade|compra|vend|negoci/i, 'mercado'],
  [/portal|nether|jefe|boss|drag/i, 'portal'],
  [/casa|house|home|hogar|saludo|hola|hello/i, 'casa'],
];
function structureKeyFor(icon, title) {
  if (icon && ICON_TO_STRUCTURE[icon]) return ICON_TO_STRUCTURE[icon];
  if (title) {
    for (const [re, key] of TITLE_KEYWORDS) if (re.test(title)) return key;
  }
  return 'casa'; // respaldo seguro (estructura base del mundo)
}

const ssl = /sslmode=disable/.test(url) ? false : { rejectUnauthorized: false };
const { Client } = pg;
const client = new Client({ connectionString: url, ssl, connectionTimeoutMillis: 15000 });
client.on('error', (e) => { console.error('conexión:', e.message); });
await client.connect();

let levelUpdates = 0, unitUpdates = 0, keystones = 0;
try {
  const levels = (await client.query(
    'select id, band, order_index from public.levels'
  )).rows;
  const units = (await client.query(
    'select id, level_id, icon, title, order_index from public.units'
  )).rows;

  // Última unidad (mayor order_index) por nivel => keystone.
  const lastUnitByLevel = new Map();
  for (const u of units) {
    if (!u.level_id) continue;
    const prev = lastUnitByLevel.get(u.level_id);
    if (!prev || (u.order_index ?? 0) > (prev.order_index ?? 0)) lastUnitByLevel.set(u.level_id, u);
  }

  if (dryRun) {
    console.log(`[dry-run] ${levels.length} nivel(es), ${units.length} unidad(es):`);
    for (const l of levels) {
      const b = biomeForBand(l.band);
      console.log(`  level band=${l.band} -> biome=${b.key} color=${b.mapColor} danger=${b.danger} world_order=${l.order_index ?? l.band ?? 0}`);
    }
    for (const u of units) {
      const isKeystone = lastUnitByLevel.get(u.level_id)?.id === u.id;
      console.log(`  unit "${(u.title || '').slice(0, 28)}" icon=${u.icon} -> structure=${structureKeyFor(u.icon, u.title)} kind=${isKeystone ? 'keystone' : 'standard'}`);
    }
    await client.end();
    process.exit(0);
  }

  await client.query('begin');

  for (const l of levels) {
    const b = biomeForBand(l.band);
    const worldOrder = l.order_index ?? clampBand(l.band);
    const res = await client.query(
      `update public.levels set
         biome_key   = coalesce(biome_key, $2),
         map_color   = coalesce(map_color, $3),
         danger      = coalesce(danger, $4),
         world_order = coalesce(world_order, $5),
         theme_key   = coalesce(theme_key, $6)
       where id = $1`,
      [l.id, b.key, b.mapColor, b.danger, worldOrder, themeForBand(l.band)]
    );
    levelUpdates += res.rowCount;
  }

  for (const u of units) {
    const structureKey = structureKeyFor(u.icon, u.title);
    const isKeystone = lastUnitByLevel.get(u.level_id)?.id === u.id;
    const kind = isKeystone ? 'keystone' : 'standard';
    if (isKeystone) keystones++;
    const res = await client.query(
      `update public.units set
         structure_key = coalesce(structure_key, $2),
         kind          = $3
       where id = $1`,
      [u.id, structureKey, kind]
    );
    unitUpdates += res.rowCount;
  }

  await client.query('commit');
} catch (e) {
  try { await client.query('rollback'); } catch {}
  console.error(`FAIL: ${e.message}`);
  await client.end();
  process.exit(1);
}

console.log(`Listo. Mundo sembrado: ${levelUpdates} nivel(es), ${unitUpdates} unidad(es) (${keystones} keystone).`);
await client.end();
