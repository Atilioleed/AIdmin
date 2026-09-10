import { getPool } from '../../../../lib/db.js';

const AGENT_HEALTH_ENDPOINTS = [
  { name: 'Desarrollo', url: 'http://localhost:4100/health' },
  { name: 'Finanzas', url: 'http://localhost:4101/health' },
  { name: 'Legal', url: 'http://localhost:4102/health' },
  { name: 'Producto', url: 'http://localhost:4103/health' },
  { name: 'CEO / Comité', url: 'http://localhost:4104/health' },
  { name: 'Marketing', url: 'http://localhost:4105/health' },
  { name: 'Approval-gate (canal humano, dinero)', url: 'http://localhost:4000/health' },
  { name: 'Content-gate (canal humano, contenido)', url: 'http://localhost:4001/health' },
];

async function checkHttp(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2000), cache: 'no-store' });
    return response.ok;
  } catch {
    return false;
  }
}

async function checkPostgres(): Promise<boolean> {
  try {
    await getPool().query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

function StatusPill({ ok }: { ok: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        ok ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {ok ? 'OK' : 'Caído'}
    </span>
  );
}

export default async function IntegrationsPage() {
  const [postgresOk, ...agentResults] = await Promise.all([
    checkPostgres(),
    ...AGENT_HEALTH_ENDPOINTS.map((e) => checkHttp(e.url)),
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Salud de integraciones</h1>
        <p className="text-sm text-neutral-500">
          Cada agente y gate corre como su propio proceso (trigger-server); si no está
          levantado localmente, aparece como &ldquo;Caído&rdquo; acá aunque esté todo
          bien en el código.
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-center justify-between border-b border-neutral-100 py-2">
          <span className="text-sm text-neutral-800">Postgres (misma base que los agentes)</span>
          <StatusPill ok={postgresOk} />
        </div>
        {AGENT_HEALTH_ENDPOINTS.map((endpoint, i) => (
          <div key={endpoint.name} className="flex items-center justify-between border-b border-neutral-100 py-2 last:border-0">
            <span className="text-sm text-neutral-800">{endpoint.name}</span>
            <StatusPill ok={agentResults[i] ?? false} />
          </div>
        ))}
      </div>
    </div>
  );
}
