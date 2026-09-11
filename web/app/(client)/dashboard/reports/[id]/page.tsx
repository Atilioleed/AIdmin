import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentTenant } from '../../../../../lib/tenant';
import { getReportById } from '../../../../../lib/queries';
import { AgentAvatar } from '../../../../../components/AgentAvatar';
import { Logo } from '../../../../../components/Logo';
import { MarkdownContent } from '../../../../../components/MarkdownContent';
import type { AgentKey } from '../../../../../components/marketing/AgentIcon';

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await getCurrentTenant();
  if (!tenant) redirect('/sin-pyme');

  const report = await getReportById(tenant.id, id);
  if (!report) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link href="/dashboard/reports" className="text-xs font-semibold text-[var(--color-violet)] hover:text-[var(--color-coral)]">
        ← Todos los documentos
      </Link>

      <article className="card overflow-hidden p-0">
        <div className="flex items-center justify-between gap-4 px-8 py-5" style={{ background: 'var(--gradient-hero)' }}>
          <Logo size="sm" muted />
          <a
            href={`/dashboard/reports/${report.id}/download`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/85 hover:border-white/40 hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3v13m0 0-4.5-4.5M12 16l4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Descargar
          </a>
        </div>

        <div className="flex items-center gap-4 border-b border-[var(--color-border-soft)] px-8 py-5">
          <AgentAvatar agent={report.slug as AgentKey} size={52} />
          <div>
            <h1 className="font-display text-xl font-semibold text-[var(--color-ink)]">{report.agentName}</h1>
            <p className="text-xs text-[var(--color-ink-faint)]">
              {new Date(report.createdAt).toLocaleString('es-CL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        <div className="px-8 py-6">
          <MarkdownContent text={report.summary} />
        </div>
      </article>
    </div>
  );
}
