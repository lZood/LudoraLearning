// Tagging HEURÍSTICO de ejercicios → conceptos (Master Plan §7, fase F2 · T2.6).
//
// Recorre las actividades de Banda 1 (join activities→units→levels WHERE levels.band=N),
// lee su `content.exercises[]` y, por COINCIDENCIA de palabras clave contra los slugs/labels
// del catálogo `concepts` (ya sembrado por 0028 + seed-concepts.mjs), asigna conceptId(s) a
// cada ejercicio escribiéndolos en `content.exercises[i].meta.conceptId` (+ `conceptIds` si
// entrena varios). Es ADITIVO al JSONB: no toca el resto del ejercicio, así que v1 sigue igual
// (los campos `meta.*` son todos opcionales en lessonContent.ts).
//
// Además: marca `concepts.needs_review=true` en los conceptos con poca cobertura (pocos o cero
// ejercicios etiquetados) para que la curación humana sepa qué falta, e imprime un reporte de
// cobertura. NUNCA inventa conceptos fuera del catálogo: solo elige de `concepts`.
//
// Idempotente y seguro:
//   - Solo reescribe `meta.conceptId` que ÉL mismo puso (marca `meta.conceptSource='heuristic'`);
//     respeta cualquier tag con otra procedencia (autoría humana) salvo --force.
//   - Solo hace UPDATE de la fila si el `content` cambió de verdad (compara JSON) → no-op estable.
//   - Todo en una transacción; --dry-run no escribe nada.
//
// Patrón de conexión idéntico a scripts/db/migrate.mjs / seed-concepts.mjs.
//
// Uso:
//   node scripts/db/tag-exercises.mjs                 -> taggea Banda 1 (rellena solo lo no tagueado)
//   node scripts/db/tag-exercises.mjs --dry-run       -> imprime plan + cobertura, sin escribir
//   node scripts/db/tag-exercises.mjs --band 2        -> otra banda
//   node scripts/db/tag-exercises.mjs --unit u1-1     -> una sola unidad (external_id)
//   node scripts/db/tag-exercises.mjs --force         -> recalcula incluso tags previos heurísticos
//   node scripts/db/tag-exercises.mjs --min-coverage 2-> umbral de cobertura para needs_review (def. 2)
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
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* sin .env.local */ }
}
loadEnv();

const url = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!url) { console.error('ERROR: falta SUPABASE_DB_URL en .env.local'); process.exit(1); }

// --- Args ---
const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const force = argv.includes('--force');
const getArg = (name, def) => { const i = argv.indexOf(name); return i >= 0 && argv[i + 1] ? argv[i + 1] : def; };
const band = parseInt(getArg('--band', '1'), 10);
const unitExt = getArg('--unit', null);
const minCoverage = parseInt(getArg('--min-coverage', '2'), 10);

// =============================================================================
// Heurística de extracción de palabras clave por concepto.
// SUPUESTO: los slugs tienen un "leaf" en inglés limpio (vocab.colors.red → 'red';
// vocab.numbers.four_five → 'four','five') y los labels traen el/los término(s)
// inglés(es) tras el último ':' y antes del paréntesis de traducción española
// ("Saludar: hello / hi", "Color: red (rojo)"). De ahí derivamos las keywords.
// Tokens de 1 letra (artículo 'a', vocal 'i') se descartan a propósito para no
// generar falsos positivos: esos conceptos quedarán con baja cobertura → needs_review,
// que es justamente la señal esperada para que un humano los etiquete a mano.
// =============================================================================

// Palabras de relleno (descriptores en español / categorías) que NO son keywords útiles.
const STOP = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'y', 'o', 'a', 'en',
  'color', 'numero', 'numeros', 'comida', 'familia', 'articulo', 'indefinido', 'definido',
  'verbo', 'sonido', 'vocal', 'corta', 'saludar', 'despedirse', 'preguntar', 'como', 'estas',
  'presentarse', 'cortesia', 'que', 'tu', 'su', 'mi', 'to', 'be',
]);

function conceptKeywords(c) {
  const terms = new Set();
  const add = (raw) => {
    const t = String(raw || '').toLowerCase().replace(/[^a-z']/g, '');
    if (t.length >= 2 && !STOP.has(t)) terms.add(t);
  };
  // 1) leaf del slug (lo más fiable: inglés limpio).
  const segs = String(c.slug || '').split('.');
  const leaf = segs[segs.length - 1] || '';
  for (const tok of leaf.split('_')) add(tok);
  // 2) términos ingleses del label: quita paréntesis (traducción ES) y toma lo de tras el ':'.
  let lab = String(c.label || '').replace(/\([^)]*\)/g, ' ');
  const afterColon = lab.includes(':') ? lab.slice(lab.lastIndexOf(':') + 1) : lab;
  for (const raw of afterColon.split(/[^A-Za-z']+/)) add(raw);
  return [...terms];
}

// Recolecta todas las cadenas de un ejercicio (robusto para los 19 tipos) EXCEPTO bajo `meta`
// (no queremos re-emparejar contra slugs ya escritos) ni el campo `type`.
function harvestStrings(node, out) {
  if (node == null) return;
  if (typeof node === 'string') { out.push(node); return; }
  if (Array.isArray(node)) { for (const x of node) harvestStrings(x, out); return; }
  if (typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === 'meta' || k === 'type') continue;
      harvestStrings(v, out);
    }
  }
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Empareja un ejercicio contra todos los conceptos; devuelve [{slug, score, sameSkill}] ordenado.
function matchConcepts(ex, activitySkill, concepts) {
  const out = [];
  harvestStrings(ex, out);
  const hay = ` ${out.join(' ').toLowerCase()} `;
  const matches = [];
  for (const c of concepts) {
    let hits = 0;
    for (const kw of c._keywords) {
      if (new RegExp(`\\b${escapeRe(kw)}\\b`).test(hay)) hits++;
    }
    if (hits > 0) {
      const sameSkill = !!activitySkill && c.skill === activitySkill;
      matches.push({ slug: c.slug, score: hits + (sameSkill ? 0.5 : 0), sameSkill });
    }
  }
  matches.sort((a, b) => b.score - a.score);
  return matches;
}

// --- Conexión ---
const ssl = /sslmode=disable/.test(url) ? false : { rejectUnauthorized: false };
const { Client } = pg;
const client = new Client({ connectionString: url, ssl, connectionTimeoutMillis: 15000 });
client.on('error', (e) => { console.error('conexión:', e.message); });
await client.connect();

try {
  // 1) Catálogo de conceptos (fuente cerrada; nunca inventamos fuera de aquí).
  const concepts = (await client.query(
    'select slug, skill, label, kind, mc_block_key from public.concepts'
  )).rows;
  if (!concepts.length) { console.error('ERROR: no hay conceptos sembrados (corre seed-concepts.mjs primero).'); await client.end(); process.exit(1); }
  for (const c of concepts) c._keywords = conceptKeywords(c);

  // 2) Actividades de la banda objetivo (o unidad concreta) con ejercicios.
  const params = [band];
  let where = 'l.band = $1';
  if (unitExt) { params.push(unitExt); where += ` and u.external_id = $${params.length}`; }
  const acts = (await client.query(
    `select a.id, a.skill, a.title, a.content, u.external_id as unit_ext
       from public.activities a
       join public.units  u on u.id = a.unit_id
       join public.levels l on l.id = u.level_id
      where ${where}
        and a.content ? 'exercises'
      order by u.order_index, a.order_index`,
    params
  )).rows;

  if (!acts.length) {
    console.log(`No hay actividades con ejercicios en banda ${band}${unitExt ? ` / unidad ${unitExt}` : ''}.`);
    await client.end();
    process.exit(0);
  }

  const coverage = new Map(); // slug -> nº de ejercicios etiquetados
  for (const c of concepts) coverage.set(c.slug, 0);
  let totalEx = 0, taggedEx = 0, changedActs = 0, skippedHuman = 0;
  const updates = []; // { id, content }

  for (const a of acts) {
    const content = a.content; // pg ya devuelve objeto para jsonb
    const exercises = Array.isArray(content?.exercises) ? content.exercises : [];
    let changed = false;

    for (const ex of exercises) {
      totalEx++;
      const prevMeta = ex.meta || {};
      const hasTag = typeof prevMeta.conceptId === 'string' && prevMeta.conceptId;
      const isHeuristic = prevMeta.conceptSource === 'heuristic';
      // Respeta autoría humana (tag con procedencia != 'heuristic') salvo --force.
      if (hasTag && !isHeuristic && !force) { skippedHuman++; if (hasTag) coverage.set(prevMeta.conceptId, (coverage.get(prevMeta.conceptId) || 0) + 1); continue; }

      const m = matchConcepts(ex, a.skill, concepts);
      if (!m.length) {
        // Sin match: si antes había tag heurístico, lo retiramos (idempotencia hacia "limpio").
        if (isHeuristic) { delete ex.meta.conceptId; delete ex.meta.conceptIds; delete ex.meta.conceptSource; if (!Object.keys(ex.meta).length) delete ex.meta; changed = true; }
        continue;
      }
      const primary = m[0].slug;
      const ids = m.slice(0, 4).map((x) => x.slug); // hasta 4 (p. ej. reading_passage / multi_select)
      const meta = { ...prevMeta, conceptId: primary, conceptSource: 'heuristic' };
      if (ids.length > 1) meta.conceptIds = ids; else delete meta.conceptIds;

      // ¿cambió algo respecto al meta previo? (idempotencia)
      const before = JSON.stringify({ conceptId: prevMeta.conceptId, conceptIds: prevMeta.conceptIds, conceptSource: prevMeta.conceptSource });
      const after = JSON.stringify({ conceptId: meta.conceptId, conceptIds: meta.conceptIds, conceptSource: meta.conceptSource });
      if (before !== after) changed = true;
      ex.meta = meta;

      taggedEx++;
      for (const s of ids) coverage.set(s, (coverage.get(s) || 0) + 1);
    }

    if (changed) { updates.push({ id: a.id, content }); changedActs++; }
  }

  // 3) Reporte de cobertura.
  const lowCov = [];
  console.log(`\n=== Cobertura de conceptos (banda ${band}${unitExt ? ` / ${unitExt}` : ''}) ===`);
  const sorted = [...coverage.entries()].sort((x, y) => x[0].localeCompare(y[0]));
  for (const [slug, n] of sorted) {
    const flag = n < minCoverage ? '  ⚠ needs_review' : '';
    if (n < minCoverage) lowCov.push(slug);
    console.log(`  ${String(n).padStart(3)}  ${slug}${flag}`);
  }
  console.log(`\nEjercicios: ${totalEx} total · ${taggedEx} etiquetados · ${skippedHuman} respetados (autoría humana).`);
  console.log(`Actividades con cambios: ${changedActs}/${acts.length}.`);
  console.log(`Conceptos con cobertura < ${minCoverage}: ${lowCov.length} → needs_review=true.`);

  if (dryRun) {
    console.log('\n[dry-run] No se escribió nada.');
    await client.end();
    process.exit(0);
  }

  // 4) Persistir (una transacción): content de actividades cambiadas + needs_review en concepts.
  await client.query('begin');
  for (const u of updates) {
    await client.query('update public.activities set content = $1::jsonb where id = $2', [JSON.stringify(u.content), u.id]);
  }
  // needs_review refleja la cobertura ACTUAL: true si baja, false si alcanzó el umbral.
  for (const [slug, n] of coverage.entries()) {
    await client.query('update public.concepts set needs_review = $1 where slug = $2', [n < minCoverage, slug]);
  }
  await client.query('commit');
  console.log(`\nListo. ${updates.length} actividad(es) actualizada(s); needs_review recalculado en ${coverage.size} concepto(s).`);
} catch (e) {
  try { await client.query('rollback'); } catch {}
  console.error(`FAIL: ${e.message}`);
  await client.end();
  process.exit(1);
}
await client.end();
