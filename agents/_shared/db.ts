import { Pool } from 'pg';

let pool: Pool | undefined;

// Pool unico y perezoso: se crea recien cuando algo lo necesita, asi los tests que no
// tocan Postgres nunca intentan abrir una conexion.
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL no esta definida (revisa tu .env).');
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
