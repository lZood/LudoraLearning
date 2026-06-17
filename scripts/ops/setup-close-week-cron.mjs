// Configura el cron semanal que dispara /api/cron/close-week en el VPS.
//  - Escribe /root/.ludora_cron_secret (600) con CRON_SECRET (vía stdin, nunca en argv/log).
//  - Crea /usr/local/bin/ludora-close-week.sh (700) que hace el POST con el header.
//  - Instala una línea de crontab idempotente: lunes 06:00 UTC.
//  - NO toca la BD/control-plane de Dokploy. Solo crea config de cron.
// Uso: node scripts/ops/setup-close-week-cron.mjs
import ssh2 from 'ssh2';
import { config } from 'dotenv';
config({ path: '.env.local' });

const SECRET = process.env.CRON_SECRET;
if (!SECRET) { console.error('Sin CRON_SECRET en .env.local'); process.exit(1); }

const { Client } = ssh2;
const conn = new Client();

// Ejecuta un comando remoto; opcionalmente alimenta `stdin`. Resuelve {code, out, err}.
function run(cmd, stdin) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '', errOut = '';
      stream
        .on('close', (code) => resolve({ code, out, err: errOut }))
        .on('data', (d) => (out += d.toString()))
        .stderr.on('data', (d) => (errOut += d.toString()));
      if (stdin !== undefined) stream.end(stdin);
    });
  });
}

const RUNNER = `#!/bin/sh
# Cierre semanal del ranking de Ludora. Lo invoca cron a diario (06:00 UTC).
# El endpoint llama close_due_weeks(): cierra TODAS las semanas pasadas no cerradas
# (catch-up idempotente), así un lunes perdido se recupera en la siguiente corrida.
SECRET=$(cat /root/.ludora_cron_secret)
echo "[$(date -u +%FT%TZ)] close-week ->"
curl -fsS -X POST -H "x-cron-secret: $SECRET" https://ludoralearning.com/api/cron/close-week
echo ""
`;

const CRON_LINE = '0 6 * * * /usr/local/bin/ludora-close-week.sh >> /var/log/ludora-close-week.log 2>&1';

conn
  .on('ready', async () => {
    try {
      // 1) Secreto en archivo root-only (alimentado por stdin -> no aparece en el comando).
      let r = await run('umask 077; cat > /root/.ludora_cron_secret && chmod 600 /root/.ludora_cron_secret && echo OK', SECRET + '\n');
      console.log('secreto:', r.out.trim() || r.err.trim(), '(code', r.code + ')');

      // 2) Script runner.
      r = await run('cat > /usr/local/bin/ludora-close-week.sh && chmod 700 /usr/local/bin/ludora-close-week.sh && echo OK', RUNNER);
      console.log('runner:', r.out.trim() || r.err.trim(), '(code', r.code + ')');

      // 3) Crontab idempotente (quita líneas previas de ludora-close-week y añade la nueva).
      const cronCmd =
        `( crontab -l 2>/dev/null | grep -v 'ludora-close-week' ; echo '${CRON_LINE}' ) | crontab - && echo OK`;
      r = await run(cronCmd);
      console.log('crontab:', r.out.trim() || r.err.trim(), '(code', r.code + ')');

      // 4) Verificación (sin imprimir el secreto: solo perms del archivo).
      r = await run('echo "--- crontab ---"; crontab -l | grep ludora-close-week; echo "--- files ---"; ls -l /usr/local/bin/ludora-close-week.sh; stat -c "%a %n" /root/.ludora_cron_secret');
      console.log(r.out.trim());
    } catch (e) {
      console.error('error:', e.message);
    } finally {
      conn.end();
    }
  })
  .on('error', (e) => { console.error('SSH error:', e.message); process.exit(1); })
  .connect({
    host: process.env.VPS_SSH_HOST,
    port: Number(process.env.VPS_SSH_PORT || 22),
    username: process.env.VPS_SSH_USER,
    password: process.env.VPS_SSH_PASSWORD,
    readyTimeout: 20000,
  });
