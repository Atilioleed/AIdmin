import { getPool } from '../../../../lib/db';

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
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{
        background: ok ? 'var(--color-good-bg)' : 'var(--color-critical-bg)',
        color: ok ? 'var(--color-good)' : 'var(--color-critical)',
      }}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${ok ? 'animate-pulse-glow' : ''}`}
        style={{ background: ok ? 'var(--color-good)' : 'var(--color-critical)' }}
      />
      {ok ? 'OK' : 'Caído'}
    </span>
  );
}

export default async function IntegrationsPage() {
  const [postgresOk, ...agentResults] = await Promise.all([
    checkPostgres(),
    ...AGENT_HEALTH_ENDPOINTS.map((e) => checkHttp(e.url)),
  ]);

  const rows = [{ name: 'Postgres (misma base que los agentes)', ok: postgresOk }].concat(
    AGENT_HEALTH_ENDPOINTS.map((endpoint, i) => ({ name: endpoint.name, ok: agentResults[i] ?? false })),
  );
  const okCount = rows.filter((r) => r.ok).length;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">
          Salud de <span className="text-gradient-warm">integraciones</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink-soft)]">
          Cada agente y gate corre como su propio proceso (trigger-server); si no está
          levantado localmente, aparece como &ldquo;Caído&rdquo; acá aunque esté todo
          bien en el código.
        </p>
      </div>

      <div className="card flex items-center gap-4 p-5">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full font-display text-base font-semibold text-white"
          style={{ background: okCount === rows.length ? 'var(--gradient-cool)' : 'var(--gradient-warm)' }}
        >
          {okCount}/{rows.length}
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--color-ink)]">servicios respondiendo</p>
          <p className="text-xs text-[var(--color-ink-faint)]">actualizado ahora mismo</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        {rows.map((row) => (
          <div
            key={row.name}
            className="flex items-center justify-between border-b border-[var(--color-border-soft)] px-5 py-3.5 last:border-0"
          >
            <span className="text-sm text-[var(--color-ink)]">{row.name}</span>
            <StatusPill ok={row.ok} />
          </div>
        ))}
      </div>
    </div>
  );
}
