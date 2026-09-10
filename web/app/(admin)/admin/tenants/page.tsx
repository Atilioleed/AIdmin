import { listTenants } from '../../../../lib/tenant';
import { PLAN_LABELS } from '../../../../lib/plans';
import { NewTenantForm } from './NewTenantForm';

const STATUS_STYLE: Record<string, { label: string; bg: string; fg: string }> = {
  trial: { label: 'Prueba', bg: 'var(--color-warn-bg)', fg: 'var(--color-warn)' },
  active: { label: 'Activa', bg: 'var(--color-good-bg)', fg: 'var(--color-good)' },
  paused: { label: 'Pausada', bg: 'var(--color-warn-bg)', fg: 'var(--color-warn)' },
  cancelled: { label: 'Cancelada', bg: 'var(--color-critical-bg)', fg: 'var(--color-critical)' },
};

export default async function TenantsPage() {
  const tenants = await listTenants();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">
          Pymes <span className="text-gradient-warm">afiliadas</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink-soft)]">
          Crear una pyme acá le da su propio set de 6 agentes de inmediato. Falta
          crear su Organization en Clerk aparte (dashboard de Clerk) y pegar el ID acá.
        </p>
      </div>

      <NewTenantForm />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
              <tr>
                <th className="px-5 py-3 font-semibold">Nombre</th>
                <th className="px-5 py-3 font-semibold">Sitio</th>
                <th className="px-5 py-3 font-semibold">Plan</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 font-semibold">Clerk Org</th>
                <th className="px-5 py-3 font-semibold">Creada</th>
              </tr>
            </thead>
            <tbody>
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[var(--color-ink-faint)]">
                    Todavía no hay pymes afiliadas — crea la primera arriba.
                  </td>
                </tr>
              )}
              {tenants.map((t) => {
                const status = STATUS_STYLE[t.status] ?? STATUS_STYLE.trial;
                return (
                  <tr key={t.id} className="border-b border-[var(--color-border-soft)] transition-colors last:border-0 hover:bg-[var(--color-surface-sunken)]">
                    <td className="px-5 py-3 font-medium text-[var(--color-ink)]">{t.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-[var(--color-ink-faint)]">
                      {t.slug ? `/sitio/${t.slug}` : '—'}
                    </td>
                    <td className="px-5 py-3 text-[var(--color-ink-soft)]">{PLAN_LABELS[t.plan]}</td>
                    <td className="px-5 py-3">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{ background: status.bg, color: status.fg }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-[var(--color-ink-faint)]">{t.clerkOrgId ?? '—'}</td>
                    <td className="px-5 py-3 text-[var(--color-ink-faint)]">
                      {new Date(t.createdAt).toLocaleDateString('es-CL')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
