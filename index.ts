import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import pg from "pg";

/**
 * Servidor MCP LudoraDB-Master v2.3.0
 * Conexión como supabase_admin (SUPERUSER)
 * Tenat-ID: ludora-prod
 */
const server = new McpServer({ 
    name: "LudoraDB-Master", 
    version: "2.3.0" 
});

// Cadena Maestra (supabase_admin)
const MASTER_CONNECTION_STRING = "postgresql://supabase_admin.ludora-prod:njvj4tzm9vves1tmmha9avtxlqzmaqkh@212.56.45.97:6543/postgres";

const db = new pg.Pool({ 
    connectionString: MASTER_CONNECTION_STRING,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: false // Estabilidad en VPS
});

db.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Error fatal de conexión (Admin):', err.stack);
    }
    console.error('👑 Conexión Administrativa Exitosa (supabase_admin)');
    release();
});

// --- HERRAMIENTAS ---

server.tool("list_tables", "Lista todas las tablas en el esquema public",
    {},
    async () => {
        const result = await db.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`);
        return { content: [{ type: "text", text: `Tablas: ${result.rows.map(r => r.table_name).join(", ")}` }] };
    }
);

server.tool("describe_table", "Muestra esquema de una tabla",
    { table_name: z.string() },
    async ({ table_name }) => {
        const result = await db.query(`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position;`, [table_name]);
        return { content: [{ type: "text", text: JSON.stringify(result.rows, null, 2) }] };
    }
);

server.tool("execute_query", "Ejecuta cualquier sentencia SQL (Privilegios de Admin)",
    { sql: z.string() },
    async ({ sql }) => {
        try {
            const result = await db.query(sql);
            return { content: [{ type: "text", text: JSON.stringify({ command: result.command, rowCount: result.rowCount, rows: result.rows }, null, 2) }] };
        } catch (error: any) {
            return { content: [{ type: "text", text: `ERROR: ${error.message}` }], isError: true };
        }
    }
);

const transport = new StdioServerTransport();
await server.connect(transport);