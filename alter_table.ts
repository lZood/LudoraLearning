import pg from 'pg';

const ADMIN_CONNECTION = "postgresql://supabase_admin.ludora-prod:njvj4tzm9vves1tmmha9avtxlqzmaqkh@212.56.45.97:6543/postgres";

// Activando SSL (necesario para SCRAM-SHA-256 en Supavisor)
const db = new pg.Pool({ 
    connectionString: ADMIN_CONNECTION, 
    ssl: { rejectUnauthorized: false } 
});

async function run() {
    try {
        console.log('--- MIGRACIÓN CON SUPERUSER + SSL ---');
        await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS age INT;');
        console.log('✅ COLUMNA age AÑADIDA CON ÉXITO');
        
        const res = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='age'");
        console.log('VERIFICADO:', res.rows[0] ? 'COLUMNA age EXISTE' : 'NO ENCONTRADA');
    } catch (e: any) {
        console.error('❌ ERROR:', e.message);
    } finally {
        await db.end();
    }
}

run();
