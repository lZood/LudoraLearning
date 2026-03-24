const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:f2r9peqzgyktehorlhhlg7f6lebj0qij@212.56.45.97:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    
    // Listar tablas
    const tablesRes = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    const tables = tablesRes.rows.map(r => r.table_name);
    console.log('--- TABLAS DISPONIBLES ---');
    tables.forEach(t => console.log(`- ${t}`));

    // Contar usuarios si existe la tabla
    if (tables.includes('usuarios')) {
      const countRes = await client.query('SELECT count(*) FROM usuarios');
      console.log(`\n--- CONTEO DE USUARIOS ---`);
      console.log(`Registros: ${countRes.rows[0].count}`);
    } else {
      console.log('\nNo se encontró una tabla llamada "usuarios".');
    }

  } catch (err) {
    console.error('ERROR AL CONECTAR:', err.message);
  } finally {
    await client.end();
  }
}

run();
