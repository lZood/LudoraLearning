// Marca la última conversación de cada lección de Conversación como mode:'voice'
// (conversación hablada en tiempo real). La primera queda como chat de texto. Idempotente.
// Uso: node scripts/db/set-voice-conversation.mjs
import pg from 'pg';
import { readFileSync } from 'node:fs';
const url = readFileSync('.env.local', 'utf8').split(/\r?\n/).find((l) => l.startsWith('SUPABASE_DB_URL=')).slice('SUPABASE_DB_URL='.length);
const c = new pg.Client({ connectionString: url, ssl: false });
c.on('error', () => {});
await c.connect();
const rows = (await c.query("select id, content from public.activities where type='lesson' and skill='conversation'")).rows;
let n = 0;
for (const r of rows) {
  const exs = r.content?.exercises || [];
  const convs = exs.filter((e) => e.type === 'conversation');
  if (!convs.length) continue;
  convs.forEach((e, i) => { e.mode = i === convs.length - 1 ? 'voice' : 'text'; });
  await c.query('update public.activities set content=$1::jsonb where id=$2', [JSON.stringify(r.content), r.id]);
  n++;
}
await c.end();
console.log(`Conversación por voz marcada en ${n} lecciones.`);
