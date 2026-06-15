// Promueve un usuario existente a maestro y (opcional) crea un grupo con alumnos.
// Uso:
//   node scripts/db/make-teacher.mjs <email-maestro> [nombreGrupo] [email-alumno1,email-alumno2,...]
import pg from 'pg';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const txt = readFileSync(join(repoRoot, '.env.local'), 'utf8');
const url = txt.split(/\r?\n/).find((l) => l.startsWith('SUPABASE_DB_URL=')).slice('SUPABASE_DB_URL='.length);

const [, , teacherEmail, groupName, studentsCsv] = process.argv;
if (!teacherEmail) { console.error('uso: node scripts/db/make-teacher.mjs <email> [grupo] [alumnos,csv]'); process.exit(1); }

const c = new pg.Client({ connectionString: url, ssl: false });
c.on('error', () => {});
await c.connect();
try {
  await c.query('begin');
  const t = await c.query("update public.users set role='teacher' where email=$1 returning id, full_name", [teacherEmail]);
  if (!t.rows.length) throw new Error(`No existe usuario con email ${teacherEmail}`);
  const teacherId = t.rows[0].id;
  await c.query('insert into public.teachers(id) values($1) on conflict (id) do nothing', [teacherId]);
  console.log(`Maestro: ${teacherEmail} (${teacherId})`);

  if (groupName) {
    const code = 'G-' + teacherId.slice(0, 6).toUpperCase();
    const g = await c.query(
      `insert into public.groups(name, teacher_id, invite_code) values($1,$2,$3)
       on conflict (invite_code) do update set name=excluded.name returning id`,
      [groupName, teacherId, code]
    );
    const groupId = g.rows[0].id;
    console.log(`Grupo: ${groupName} (${groupId}) code=${code}`);
    if (studentsCsv) {
      for (const email of studentsCsv.split(',').map((s) => s.trim()).filter(Boolean)) {
        const s = await c.query('select id from public.users where email=$1', [email]);
        if (!s.rows.length) { console.log(`  (alumno no encontrado: ${email})`); continue; }
        await c.query(
          'insert into public.group_members(group_id, student_id) values($1,$2) on conflict (group_id, student_id) do nothing',
          [groupId, s.rows[0].id]
        );
        console.log(`  + alumno ${email}`);
      }
    }
  }
  await c.query('commit');
  console.log('OK');
} catch (e) {
  await c.query('rollback');
  console.error('FAIL:', e.message);
  process.exitCode = 1;
}
await c.end();
