import { readFileSync, writeFileSync } from 'node:fs';
const d = JSON.parse(readFileSync('./scripts/db/data/lesson-content.json','utf8'));
const clean = s => s.replace(/\s*\([^)]*\)\s*/g,' ').replace(/\s+/g,' ').trim();
const out = {};
for (const k of Object.keys(d)) {
  const e = d[k]; const ext = e.unitExt;
  const slides = e.content?.theory?.slides ?? [];
  const vocab = []; const seen = new Set();
  for (const s of slides) for (const p of (s.phrases ?? [])) {
    const m = p.split(/\s+[—–-]\s+/);
    if (m.length < 2) continue;
    let en = clean(m[0]); let es = clean(m.slice(1).join(' - '));
    if (!en || !es || seen.has(en.toLowerCase())) continue;
    seen.add(en.toLowerCase()); vocab.push({ en, es });
  }
  out[ext] = { vocab };
}
writeFileSync('./scripts/db/data/_unit-source.json', JSON.stringify(out));
const exts = Object.keys(out);
console.log('unidades:', exts.length);
console.log('u1-1 en json?', exts.includes('u1-1'), '| u1-2 en json?', exts.includes('u1-2'));
const low = exts.filter(x => out[x].vocab.length < 6);
console.log('con <6 vocab:', low.map(x=>`${x}(${out[x].vocab.length})`).join(', ')||'ninguna');
console.log('\nu5-1 vocab:', JSON.stringify(out['u5-1'].vocab));
