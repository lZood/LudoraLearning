// Seed del currículo: vuelca COURSE_DATA (8 niveles x 6 unidades) a BD + 6 actividades por unidad.
// Idempotente. Uso: node scripts/db/seed-curriculum.ts
import pg from 'pg';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { COURSE_DATA } from '../../src/constants/courseData.ts';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = readFileSync(join(repoRoot, '.env.local'), 'utf8')
  .split(/\r?\n/).find((l) => l.startsWith('SUPABASE_DB_URL=')).slice('SUPABASE_DB_URL='.length);

const iconName = (icon: unknown): string => {
  const c = icon as { displayName?: string; render?: { displayName?: string } } | undefined;
  return c?.displayName || c?.render?.displayName || 'BookOpen';
};
const bandFor = (order: number): number => (order <= 3 ? 1 : order <= 6 ? 2 : 3);

const ACTIVITY_TEMPLATE = [
  { type: 'theory',   title: 'Teoría',          xp: 10 },
  { type: 'exercise', title: 'Ejercicios',      xp: 15 },
  { type: 'audio',    title: 'Escucha',         xp: 15 },
  { type: 'midterm',  title: 'Repaso',          xp: 20 },
  { type: 'chat',     title: 'Conversación',    xp: 20 },
  { type: 'final',    title: 'Reto final',      xp: 30 },
];

const c = new pg.Client({ connectionString: url, ssl: false });
c.on('error', () => {});
await c.connect();
await c.query('begin');
try {
  const course = await c.query(
    `insert into public.courses(slug, name, description, total_levels)
     values('ingles-minecraft','Inglés Minecraft','Curso gamificado de inglés con temática Minecraft', $1)
     on conflict (slug) do update set total_levels=excluded.total_levels returning id`,
    [COURSE_DATA.length]
  );
  const courseId = course.rows[0].id;
  let units = 0, acts = 0;

  for (let li = 0; li < COURSE_DATA.length; li++) {
    const lvl = COURSE_DATA[li];
    const order = li + 1;
    const lr = await c.query(
      `insert into public.levels(course_id, external_id, title, subtitle, order_index, band)
       values($1,$2,$3,$4,$5,$6)
       on conflict (external_id) do update set title=excluded.title, subtitle=excluded.subtitle, order_index=excluded.order_index, band=excluded.band
       returning id`,
      [courseId, lvl.id, lvl.title, lvl.subtitle, order, bandFor(order)]
    );
    const levelId = lr.rows[0].id;

    for (let ui = 0; ui < lvl.units.length; ui++) {
      const u = lvl.units[ui];
      const ur = await c.query(
        `insert into public.units(external_id, level_id, title, icon, order_index, is_new)
         values($1,$2,$3,$4,$5,$6)
         on conflict (external_id) do update set level_id=excluded.level_id, title=excluded.title, icon=excluded.icon, order_index=excluded.order_index, is_new=excluded.is_new
         returning id`,
        [u.id, levelId, u.title, iconName(u.icon), ui + 1, !!u.isNew]
      );
      const unitId = ur.rows[0].id;
      units++;
      await c.query('delete from public.activities where unit_id=$1', [unitId]);
      for (let ai = 0; ai < ACTIVITY_TEMPLATE.length; ai++) {
        const a = ACTIVITY_TEMPLATE[ai];
        await c.query(
          `insert into public.activities(unit_id, type, title, order_index, xp_reward) values($1,$2,$3,$4,$5)`,
          [unitId, a.type, a.title, ai + 1, a.xp]
        );
        acts++;
      }
    }
  }
  await c.query('commit');
  console.log(`OK: 1 curso, ${COURSE_DATA.length} niveles, ${units} unidades, ${acts} actividades.`);
} catch (e) {
  await c.query('rollback');
  console.error('FAIL:', (e as Error).message);
  process.exitCode = 1;
}
await c.end();
