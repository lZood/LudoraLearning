const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://supabase_admin.ludora-prod:njvj4tzm9vves1tmmha9avtxlqzmaqkh@212.56.45.97:6543/postgres',
    ssl: false // User specified false in index.ts
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to DB');
        
        await client.query('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS has_completed_evaluation BOOLEAN DEFAULT FALSE;');
        console.log('Column has_completed_evaluation added');
        
        await client.query("UPDATE public.users SET has_completed_evaluation = TRUE WHERE english_level IS NOT NULL;");
        console.log('Backfill complete');
        
    } catch (err) {
        console.error('Error detail:', err);
    } finally {
        await client.end();
    }
}

run();
