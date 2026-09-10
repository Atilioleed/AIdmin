import { Pool } from 'pg';

// Pool propio del panel web contra la misma Postgres que usan los agentes. No se
// reimplementa la logica de los gates aqui - eso vive en approval-gate/content-gate y
// se llama por HTTP (ver lib/gates.ts). Esto es solo lectura de datos para las
// pantallas (tenants, reports, decisions_log, client_uploads).
let pool: Pool | undefined;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL no esta definida (revisa web/.env.local).');
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}
