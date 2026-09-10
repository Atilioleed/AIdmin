import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTenantById } from '../../../../../lib/tenant';
import { getTenantUsageSummary } from '../../../../../lib/agent-usage';
import { PLAN_LABELS } from '../../../../../lib/plans';
import { AGENTS, AgentIcon } from '../../../../../components/marketing/AgentIcon';
import { CapForm } from './CapForm';

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await getTenantById(id);
  if (!tenant) notFound();

  const usage = await getTenantUsageSummary(id);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div>
        <Link href="/admin/tenants" className="text-xs font-semibold text-[var(--color-violet)] hover:text-[var(--color-coral)]">
          ← Todas las pymes
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--color-ink)]">
          {tenant.name} <span className="text-gradient-warm">· {PLAN_LABELS[tenant.plan]}</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink-soft)]">
          Uso de tokens por agente. Cada corrida del comité consume tokens de entrada/salida del
          modelo — no medimos &quot;horas trabajadas&quot; porque los agentes no corren en tiempo real
          continuo, corren en ráfagas cortas varias veces al día.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Tope diario de costo</h2>
        <p className="mt-1 max-w-xl text-sm text-[var(--color-ink-soft)]">
          Si un agente llega a este tope de tokens en un día, deja de llamar al modelo hasta el día
          siguiente — protege el costo real para AIdmin sin dejar de trabajar para el cliente el
          resto de los agentes.
        </p>
        <div className="mt-4">
          <CapForm tenantId={id} capTokens={usage[0]?.capTokens ?? 200000} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
              <tr>
                <th className="px-5 py-3 font-semibold">Agente</th>
                <th className="px-5 py-3 font-semibold">Uso de hoy</th>
                <th className="px-5 py-3 font-semibold">Corridas hoy</th>
                <th className="px-5 py-3 font-semibold">Últimos 7 días</th>
              </tr>
            </thead>
            <tbody>
              {usage.map((row) => {
                const agent = AGENTS.find((a) => a.key === row.agentSlug)!;
                const pct = Math.min(100, Math.round((row.todayTokens / row.capTokens) * 100));
                const capped = row.todayCappedRuns > 0;
                return (
                  <tr key={row.agentSlug} className="border-b border-[var(--color-border-soft)] last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                          style={{ background: 'var(--gradient-brand)' }}
                        >
                          <AgentIcon agent={row.agentSlug} size={15} />
                        </span>
                        <span className="font-medium text-[var(--color-ink)]">{agent.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-[var(--color-ink-soft)]">
                          {row.todayTokens.toLocaleString('es-CL')} / {row.capTokens.toLocaleString('es-CL')} tokens
                        </span>
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[var(--color-border-soft)]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background: pct >= 100 ? 'var(--color-critical)' : 'var(--gradient-brand)',
                            }}
                          />
                        </div>
                        {capped && (
                          <span className="text-[11px] font-semibold text-[var(--color-critical)]">
                            Tope alcanzado hoy — {row.todayCappedRuns} corrida(s) sin ejecutar
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[var(--color-ink-soft)]">{row.todayRuns}</td>
                    <td className="px-5 py-4 text-[var(--color-ink-soft)]">
                      {row.last7DaysTokens.toLocaleString('es-CL')} tokens · {row.last7DaysRuns} corridas
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
