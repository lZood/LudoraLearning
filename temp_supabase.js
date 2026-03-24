const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://blackboard-supabase-d13226-212-56-45-97.traefik.me';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzI5MjY2NDcsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.oIql5Yy6-EQFHntg-CCtq-Rq4dUpXX-n4U7PhcLPIQc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    try {
        console.log('--- CONEXIÓN CON SUPABASE SDK ---');
        
        const { count, error } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });
            
        if (error) {
            console.error('ERROR EN SUPABASE:', error.message);
            return;
        }
        
        console.log(`TOTAL REGISTROS EN LA TABLA "users": ${count}`);

    } catch (err) {
        console.error('ERROR FATAL:', err.message);
    }
}

run();
