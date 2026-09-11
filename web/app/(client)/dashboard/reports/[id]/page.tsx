import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentTenant } from '../../../../../lib/tenant';
import { getReportById } from '../../../../../lib/queries';
import { AgentAvatar } from '../../../../../components/AgentAvatar';
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

      <div className="card p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <AgentAvatar agent={report.slug as AgentKey} size={56} />
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
          <a
            href={`/dashboard/reports/${report.id}/download`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-semibold text-[var(--color-ink-soft)] hover:border-[var(--color-violet)] hover:text-[var(--color-violet)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3v13m0 0-4.5-4.5M12 16l4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Descargar
          </a>
        </div>

        <div className="mt-6 whitespace-pre-wrap border-t border-[var(--color-border-soft)] pt-6 text-sm leading-relaxed text-[var(--color-ink-soft)]">
          {report.summary}
        </div>
      </div>
    </div>
  );
}
