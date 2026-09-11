import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentTenant } from '../../../lib/tenant';
import { getLatestReport, listAgentActivity } from '../../../lib/queries';
import { OnboardingChecklist } from './OnboardingChecklist';
import { AcceptTermsCard } from './AcceptTermsCard';
import { AgentNetworkVisual } from '../../../components/AgentNetworkVisual';
import { AgentAvatar } from '../../../components/AgentAvatar';
import { Logo } from '../../../components/Logo';
import { MarkdownContent } from '../../../components/MarkdownContent';
import { AGENTS } from '../../../components/marketing/AgentIcon';
import type { AgentKey } from '../../../components/marketing/AgentIcon';

export default async function DashboardPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect('/sin-pyme');

  const [pauta, activity] = await Promise.all([
    getLatestReport(tenant.id, 'ceo'),
    listAgentActivity(tenant.id),
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {!tenant.termsAcceptedAt && <AcceptTermsCard />}

      <AgentNetworkVisual
        title="Tu comité, trabajando ahora"
        subtitle="Los 6 gerentes de IA de tu pyme siguen conectados, se pasan información entre sí y nunca se detienen — esto es actividad real, no decoración."
        activity={activity.map((a) => ({ agentSlug: a.slug as AgentKey, lastActiveAt: a.lastActiveAt }))}
      />

      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {AGENTS.map((agent) => (
            <div key={agent.key} className="flex flex-col items-center gap-1">
              <AgentAvatar agent={agent.key} size={56} />
              <span className="text-[11px] font-semibold text-[var(--color-ink)]">{agent.name}</span>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/dashboard/chat"
        className="card group flex items-center justify-between gap-4 overflow-hidden p-5 transition-transform hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
        style={{ background: 'var(--gradient-hero)' }}
      >
        <div className="flex items-center gap-4">
          <AgentAvatar agent="ceo" size={52} />
          <div>
            <p className="font-display text-base font-semibold text-white">Chatea con el CEO</p>
            <p className="text-xs text-white/65">Pídele un reporte en vivo, una recomendación o el estado de algo, y responde al toque.</p>
          </div>
        </div>
        <span className="shrink-0 text-white/70 transition-transform group-hover:translate-x-1">→</span>
      </Link>

      <OnboardingChecklist tenantId={tenant.id} termsAcceptedAt={tenant.termsAcceptedAt} />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h1 className="font-display text-xl font-semibold text-[var(--color-ink)]">Pauta de comité</h1>
          <Link href="/dashboard/reports" className="text-xs font-semibold text-[var(--color-violet)] hover:text-[var(--color-coral)]">
            Ver todos los documentos →
          </Link>
        </div>
        {!pauta ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-[var(--color-ink-faint)]">
              Todavía no hay una pauta generada. El agente CEO la arma después de que los demás
              agentes hayan corrido.
            </p>
          </div>
        ) : (
          <article className="card overflow-hidden p-0">
            <div className="flex items-center justify-between gap-4 px-6 py-4" style={{ background: 'var(--gradient-hero)' }}>
              <Logo size="sm" muted />
              <div className="flex items-center gap-2.5">
                <AgentAvatar agent="ceo" size={36} animated={false} />
                <p className="text-xs text-white/70">{new Date(pauta.createdAt).toLocaleString('es-CL')}</p>
              </div>
            </div>
            <div className="px-6 py-6">
              <MarkdownContent text={pauta.summary} />
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
