import { getPool } from '../../../../lib/db';
import { TestEmailForm } from './TestEmailForm';

// URL configurable por env var (para cuando el trigger-server de ese agente/gate
// vive en un servidor real, no en la maquina de quien mira este panel) - si no hay
// env var, cae al default de localhost (unico caso donde tiene sentido: viendo el
// panel EN la misma maquina donde corren los procesos locales via `npm run dev:*`).
function endpointUrl(envVar: string, localPort: number): string {
  return process.env[envVar] || `http://localhost:${localPort}/health`;
}

const AGENT_HEALTH_ENDPOINTS = [
  { name: 'Desarrollo', url: endpointUrl('DESARROLLO_TRIGGER_URL', 4100) },
  { name: 'Finanzas', url: endpointUrl('FINANZAS_TRIGGER_URL', 4101) },
  { name: 'Legal', url: endpointUrl('LEGAL_TRIGGER_URL', 4102) },
  { name: 'Producto', url: endpointUrl('PRODUCTO_TRIGGER_URL', 4103) },
  { name: 'CEO / Comité', url: endpointUrl('CEO_TRIGGER_URL', 4104) },
  { name: 'Marketing', url: endpointUrl('MARKETING_TRIGGER_URL', 4105) },
  { name: 'Approval-gate (canal humano, dinero)', url: `${process.env.APPROVAL_GATE_URL || 'http://localhost:4000'}/health` },
  { name: 'Content-gate (canal humano, contenido)', url: `${process.env.CONTENT_GATE_URL || 'http://localhost:4001'}/health` },
];

const usingLocalDefaults = AGENT_HEALTH_ENDPOINTS.some((e) => e.url.includes('localhost'));

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
          Cada agente y gate corre como su propio proceso (trigger-server) que
          necesita estar levantado en algún servidor, no dentro de este panel web.
        </p>
      </div>

      {usingLocalDefaults && (
        <div
          className="card p-5"
          style={{ borderColor: 'var(--color-warn)', background: 'var(--color-warn-bg)' }}
        >
          <p className="text-sm font-semibold text-[var(--color-warn)]">
            Este panel está chequeando localhost, no un servidor real
          </p>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            Ningún trigger-server (ni approval-gate/content-gate) tiene su URL configurada
            todavía — por eso salen &ldquo;Caído&rdquo; al mirar este panel desde producción:
            &ldquo;localhost&rdquo; ahí es el propio servidor de Vercel, no tu compu. Para que
            queden en verde de verdad hace falta desplegar esos procesos en un servidor
            siempre encendido y configurar <code className="text-xs">DESARROLLO_TRIGGER_URL</code>,{' '}
            <code className="text-xs">FINANZAS_TRIGGER_URL</code>, etc. (una por agente/gate) en
            las variables de entorno del panel — ver <code className="text-xs">.env.local.example</code>.
          </p>
        </div>
      )}

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

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">
            Alertas por correo (Resend)
          </h2>
          <StatusPill ok={Boolean(process.env.RESEND_API_KEY)} />
        </div>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          El CEO de cada pyme manda un correo al dueño cuando arma la pauta del día y queda algo
          pendiente de aprobación o revisión — se configura en <code className="text-xs">/dashboard/negocio</code>{' '}
          de cada cliente. Remitente actual:{' '}
          <span className="font-mono text-xs">{process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}</span>.
        </p>
        {!process.env.RESEND_API_KEY && (
          <p className="mt-1 text-sm text-[var(--color-warn)]">
            Falta configurar <code className="text-xs">RESEND_API_KEY</code> — hasta entonces el
            envío queda deshabilitado sin romper nada más.
          </p>
        )}
        <div className="mt-4">
          <TestEmailForm />
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">WhatsApp</h2>
          <span
            className="rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ background: 'var(--color-warn-bg)', color: 'var(--color-warn)' }}
          >
            Preparado, sin conectar
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-ink-soft)]">
          El chat en vivo con el CEO por WhatsApp (para que el dueño reciba y pida información en
          tiempo real) todavía no está construido, pero ya está preparado para conectarse rápido:
        </p>
        <ul className="mt-3 flex flex-col gap-1.5 text-sm text-[var(--color-ink-soft)]">
          <li>
            • <code className="text-xs">/dashboard/negocio</code> ya recolecta el número de WhatsApp
            del dueño de cada pyme — no hay que volver a pedirlo el día que se conecte.
          </li>
          <li>• Falta elegir proveedor (Twilio, 360dialog o Meta Cloud API directo) y crear esa cuenta.</li>
          <li>• Falta un webhook receptor de mensajes entrantes y mapear teléfono → pyme/sesión.</li>
          <li>
            • El CEO hoy solo puede leer y recomendar (<code className="text-xs">recommend_only</code>)
            — que pueda &quot;hacer cambios&quot; por chat requiere darle herramientas de escritura reales,
            una decisión de gobernanza aparte antes de construirse.
          </li>
        </ul>
      </div>
    </div>
  );
}
