// Seed del banco de preguntas: importa questionBank de questions.ts y lo vuelca a BD.
// Idempotente (upsert por id; reemplaza opciones). Uso: node scripts/db/seed-questions.ts
import pg from 'pg';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { questionBank } from '../../src/app/portal-alumno/evaluacion/questions.ts';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
function loadEnv() {
  const txt = readFileSync(join(repoRoot, '.env.local'), 'utf8');
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv();

const url = process.env.SUPABASE_DB_URL;
if (!url) { console.error('falta SUPABASE_DB_URL'); process.exit(1); }

const client = new pg.Client({ connectionString: url, ssl: false, connectionTimeoutMillis: 15000 });
client.on('error', () => {});
await client.connect();

// Skills derivados del banco (un skill por skillId, con su categoría/nivel).
const skills = new Map<string, { id: string; category: string; cefr: string }>();
for (const q of questionBank) {
  if (q.skillId && !skills.has(q.skillId)) skills.set(q.skillId, { id: q.skillId, category: q.category, cefr: q.level });
}

await client.query('begin');
try {
  for (const s of skills.values()) {
    await client.query(
      `insert into public.skills(id,name,category,cefr_level) values($1,$2,$3,$4)
       on conflict (id) do update set category=excluded.category, cefr_level=excluded.cefr_level`,
      [s.id, s.id, s.category, s.cefr]
    );
  }
  for (const q of questionBank) {
    await client.query(
      `insert into public.questions(id,skill_id,level,category,type,text,audio_url,grading_rubric,expected_keywords,is_active,version)
       values($1,$2,$3,$4,$5,$6,$7,$8,$9,true,1)
       on conflict (id) do update set
         skill_id=excluded.skill_id, level=excluded.level, category=excluded.category,
         type=excluded.type, text=excluded.text, audio_url=excluded.audio_url,
         grading_rubric=excluded.grading_rubric, expected_keywords=excluded.expected_keywords, is_active=true`,
      [q.id, q.skillId ?? null, q.level, q.category, q.type, q.text, q.audioUrl ?? null,
       q.gradingRubric ?? null, q.expectedKeywords ?? null]
    );
    await client.query('delete from public.question_options where question_id=$1', [q.id]);
    if (Array.isArray(q.options)) {
      let i = 0;
      for (const o of q.options) {
        await client.query(
          `insert into public.question_options(question_id,text,image_url,is_correct,order_index)
           values($1,$2,$3,$4,$5)`,
          [q.id, o.text, o.imageUrl ?? null, !!o.isCorrect, i++]
        );
      }
    }
  }
  await client.query('commit');
  console.log(`OK: ${skills.size} skills, ${questionBank.length} preguntas sembradas.`);
} catch (e) {
  await client.query('rollback');
  console.error('FAIL seed:', (e as Error).message);
  process.exitCode = 1;
}
await client.end();
