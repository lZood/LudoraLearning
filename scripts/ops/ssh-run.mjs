// Runner SSH no interactivo (password auth) sobre el VPS.
// Lee credenciales de .env.local (VPS_SSH_*). Uso:
//   node scripts/ops/ssh-run.mjs "comando remoto"
//   echo "comando largo" | node scripts/ops/ssh-run.mjs --stdin
import ssh2 from 'ssh2';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const { Client } = ssh2;
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function loadEnv() {
  try {
    const txt = readFileSync(join(repoRoot, '.env.local'), 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {}
}
loadEnv();

let cmd;
if (process.argv[2] === '--stdin') {
  cmd = readFileSync(0, 'utf8');
} else {
  cmd = process.argv.slice(2).join(' ');
}
if (!cmd) { console.error('uso: node scripts/ops/ssh-run.mjs "comando"'); process.exit(2); }

const conn = new Client();
conn
  .on('ready', () => {
    conn.exec(cmd, (err, stream) => {
      if (err) { console.error('exec error:', err.message); conn.end(); process.exit(1); }
      stream
        .on('close', (code) => { conn.end(); process.exit(code || 0); })
        .on('data', (d) => process.stdout.write(d))
        .stderr.on('data', (d) => process.stderr.write(d));
    });
  })
  .on('error', (e) => { console.error('SSH error:', e.message); process.exit(1); })
  .connect({
    host: process.env.VPS_SSH_HOST,
    port: Number(process.env.VPS_SSH_PORT || 22),
    username: process.env.VPS_SSH_USER,
    password: process.env.VPS_SSH_PASSWORD,
    readyTimeout: 20000,
  });
