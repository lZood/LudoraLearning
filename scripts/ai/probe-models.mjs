// Sondea qué modelos de Gemini responden con la key del proyecto y con qué calidad/latencia,
// usando un prompt representativo de tarea FAST (explicación corta, tema Minecraft, en español).
import { readFileSync } from 'node:fs';
const env = readFileSync('.env.local', 'utf8').split(/\r?\n/);
const KEY = (env.find((x) => x.startsWith('GEMINI_API_KEY=')) || '').slice('GEMINI_API_KEY='.length).replace(/^["']|["']$/g, '');
if (!KEY) { console.error('Falta GEMINI_API_KEY'); process.exit(1); }

const CANDIDATES = [
  'gemini-3.1-flash-lite',
  'gemini-3-flash-preview',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-flash-lite-latest',
];
const PROMPT = 'En una sola frase breve (máx 20 palabras), en español y con tono de aventura Minecraft, explica por qué "I have three diamonds" es la traducción correcta de "Tengo tres diamantes". Solo la frase.';

async function probe(model) {
  const t0 = Date.now();
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: PROMPT }] }] }),
    });
    const ms = Date.now() - t0;
    if (!r.ok) { const t = await r.text(); return { model, ok: false, ms, err: `${r.status} ${t.slice(0, 120)}` }; }
    const d = await r.json();
    const text = d?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '(sin texto)';
    return { model, ok: true, ms, text };
  } catch (e) { return { model, ok: false, ms: Date.now() - t0, err: e.message }; }
}

for (const m of CANDIDATES) {
  const res = await probe(m);
  if (res.ok) console.log(`✅ ${m}  (${res.ms}ms)\n   ${res.text}\n`);
  else console.log(`❌ ${m}  (${res.ms}ms)  ${res.err}\n`);
}
