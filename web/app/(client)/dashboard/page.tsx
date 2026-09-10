import { redirect } from 'next/navigation';
import { getCurrentTenant } from '../../../lib/tenant';
import { getLatestReport, listAgentActivity } from '../../../lib/queries';
import { OnboardingChecklist } from './OnboardingChecklist';
import { AgentNetworkVisual } from '../../../components/AgentNetworkVisual';
import type { AgentKey } from '../../../components/marketing/AgentIcon';

export default async function DashboardPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect('/sin-pyme');

  const [pauta, activity] = await Promise.all([
    getLatestReport(tenant.id, 'ceo'),
    listAgentActivity(tenant.id),
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <AgentNetworkVisual
        title="Tu comité, trabajando ahora"
        subtitle="Los 6 gerentes de IA de tu pyme siguen conectados, se pasan información entre sí y nunca se detienen — esto es actividad real, no decoración."
        activity={activity.map((a) => ({ agentSlug: a.slug as AgentKey, lastActiveAt: a.lastActiveAt }))}
      />
      <OnboardingChecklist tenantId={tenant.id} />
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
