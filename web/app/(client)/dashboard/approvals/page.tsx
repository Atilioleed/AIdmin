import { redirect } from 'next/navigation';
import { getCurrentTenant } from '../../../../lib/tenant';
import { listPendingApprovals } from '../../../../lib/queries';
import { ApprovalCard } from './ApprovalCard';

export default async function ApprovalsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect('/sin-pyme');

  const approvals = await listPendingApprovals(tenant.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Aprobaciones pendientes</h1>
        <p className="text-sm text-neutral-500">
          Dinero y campañas pagas de cualquier agente. Ninguno puede ejecutar esto por
          su cuenta - siempre queda esperando tu decisión aquí.
        </p>
      </div>
      {approvals.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">
          No hay nada pendiente ahora mismo.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {approvals.map((a) => (
            <ApprovalCard
              key={a.id}
              id={a.id}
              agentSlug={a.agentSlug}
              actionType={a.actionType}
              payload={a.payload}
              requestedAt={a.requestedAt.toISOString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
