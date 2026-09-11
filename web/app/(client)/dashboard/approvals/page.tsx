import { redirect } from 'next/navigation';
import { getCurrentTenant } from '../../../../lib/tenant';
import { listPendingApprovals } from '../../../../lib/queries';
import { AgentAvatar } from '../../../../components/AgentAvatar';
import { AGENTS } from '../../../../components/marketing/AgentIcon';
import type { AgentKey } from '../../../../components/marketing/AgentIcon';
import { ApprovalCard } from './ApprovalCard';

export default async function ApprovalsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect('/sin-pyme');

  const approvals = await listPendingApprovals(tenant.id);

  const byAgent = new Map<string, typeof approvals>();
  for (const a of approvals) {
    byAgent.set(a.agentSlug, [...(byAgent.get(a.agentSlug) ?? []), a]);
  }
  const groups = AGENTS.filter((agent) => byAgent.has(agent.key));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">
          Aprobaciones <span className="text-gradient-warm">por gerencia</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink-soft)]">
          Dinero y campañas pagas de cualquier agente. Ninguno puede ejecutar esto por su cuenta —
          siempre queda esperando tu decisión aquí.
        </p>
      </div>

      {approvals.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-[var(--color-ink-faint)]">No hay nada pendiente ahora mismo.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((agent) => {
            const items = byAgent.get(agent.key) ?? [];
            return (
              <div key={agent.key}>
                <div className="mb-3 flex items-center gap-3">
                  <AgentAvatar agent={agent.key as AgentKey} size={40} animated={false} />
                  <div>
                    <p className="font-display text-base font-semibold text-[var(--color-ink)]">{agent.name}</p>
                    <p className="text-xs text-[var(--color-ink-faint)]">
                      {items.length} pendiente{items.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {items.map((a) => (
                    <ApprovalCard
                      key={a.id}
                      id={a.id}
                      actionType={a.actionType}
                      payload={a.payload}
                      requestedAt={a.requestedAt.toISOString()}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
