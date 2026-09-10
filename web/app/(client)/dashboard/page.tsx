import { redirect } from 'next/navigation';
import { getCurrentTenant } from '../../../lib/tenant.js';
import { getLatestReport } from '../../../lib/queries.js';

export default async function DashboardPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect('/sin-pyme');

  const pauta = await getLatestReport(tenant.id, 'ceo');

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <h1 className="text-lg font-semibold text-neutral-900">Pauta de comité</h1>
      {!pauta ? (
        <p className="rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">
          Todavía no hay una pauta generada. El agente CEO la arma después de que los
          demás agentes hayan corrido (ver README del proyecto para disparar una
          corrida manual).
        </p>
      ) : (
        <article className="rounded-lg border border-neutral-200 bg-white p-6">
          <p className="mb-4 text-xs text-neutral-500">
            {new Date(pauta.createdAt).toLocaleString('es-CL')}
          </p>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
            {pauta.summary}
          </div>
        </article>
      )}
    </div>
  );
}
