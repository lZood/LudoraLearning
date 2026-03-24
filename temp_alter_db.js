const pg = require('pg');
const pool = new pg.Pool({ 
    connectionString: 'postgresql://supabase_admin.ludora-prod:njvj4tzm9vves1tmmha9avtxlqzmaqkh@212.56.45.97:6543/postgres',
    ssl: false 
});

async function run() {
    try {
        console.log('--- Altering Table ---');
        await pool.query('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS has_completed_evaluation BOOLEAN DEFAULT FALSE;');
        console.log('✅ Column has_completed_evaluation added to public.users');
        
        // Also ensure any current users with english_level have it set to TRUE
        await pool.query("UPDATE public.users SET has_completed_evaluation = TRUE WHERE english_level IS NOT NULL;");
        console.log('✅ Updated existing users with level');
        
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

run();
