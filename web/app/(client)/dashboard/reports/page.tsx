import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentTenant } from '../../../../lib/tenant';
import { listReports, listReportDates, type ReportRow } from '../../../../lib/queries';
import { AgentAvatar } from '../../../../components/AgentAvatar';
import { stripMarkdown } from '../../../../components/MarkdownContent';
import type { AgentKey } from '../../../../components/marketing/AgentIcon';

function formatDateLabel(day: string): string {
  const date = new Date(`${day}T12:00:00`);
  return date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
}

function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

const RANGE_OPTIONS = [
  { value: '', label: 'Todo el historial' },
  { value: 'semana', label: 'Última semana' },
  { value: 'mes', label: 'Último mes' },
] as const;

type RangeValue = (typeof RANGE_OPTIONS)[number]['value'];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string; rango?: string }>;
}) {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect('/sin-pyme');

  const { fecha, rango } = await searchParams;
  const rangoValue: RangeValue = rango === 'semana' || rango === 'mes' ? rango : '';

  // El selector de rango y el de fecha exacta son excluyentes: si hay rango, se
  // ignora la fecha exacta (evita que ambos filtros compitan en la misma consulta).
  const today = toDayKey(new Date());
  const from = rangoValue === 'semana' ? toDayKey(addDays(new Date(), -6)) : rangoValue === 'mes' ? toDayKey(addDays(new Date(), -29)) : undefined;
  const exactDate = rangoValue ? undefined : fecha;

  const [reports, dates] = await Promise.all([
    listReports(tenant.id, 200, { onDate: exactDate, from, to: from ? today : undefined }),
    listReportDates(tenant.id),
  ]);

  // Agrupa por dia para que el historial de varias semanas/meses se pueda escanear
  // rapido, en vez de una lista plana de decenas de documentos.
  const groups: { day: string; reports: ReportRow[] }[] = [];
  for (const r of reports) {
    const day = toDayKey(new Date(r.createdAt));
    const last = groups[groups.length - 1];
    if (last && last.day === day) {
      last.reports.push(r);
    } else {
      groups.push({ day, reports: [r] });
    }
  }

  const hasFilter = Boolean(exactDate || rangoValue);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">
          Documentos del <span className="text-gradient-warm">comité</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink-soft)]">
          Un documento por cada reporte de tus gerentes. Revisa el historial por semana, por mes o
          por un día puntual, míralos online o descárgalos.
        </p>
      </div>

      <form className="card flex flex-wrap items-end gap-3 p-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">Rango</label>
          <select
            name="rango"
            defaultValue={rangoValue}
            className="w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-violet)]/40"
          >
            {RANGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">O un día puntual</label>
          <select
            name="fecha"
            defaultValue={rangoValue ? '' : (fecha ?? '')}
            className="w-56 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-violet)]/40"
          >
            <option value="">Cualquier día</option>
            {dates.map((d) => (
              <option key={d} value={d}>
                {formatDateLabel(d)}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)]"
          style={{ background: 'var(--gradient-brand)' }}
        >
          Buscar
        </button>
        {hasFilter && (
          <Link href="/dashboard/reports" className="text-xs font-semibold text-[var(--color-ink-faint)] hover:text-[var(--color-violet)]">
            Limpiar
          </Link>
        )}
      </form>

      {reports.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-[var(--color-ink-faint)]">
            {hasFilter ? 'No hay documentos en ese rango.' : 'Todavía no hay documentos. Tu comité los va a generar apenas corran los agentes.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <div key={group.day} className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">
                {formatDateLabel(group.day)}
              </p>
              <div className="flex flex-col gap-3">
                {group.reports.map((r) => (
                  <div key={r.id} className="card flex items-center gap-4 p-4 transition-shadow hover:shadow-[var(--shadow-card-hover)]">
                    <AgentAvatar agent={r.slug as AgentKey} size={48} animated={false} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--color-ink)]">{r.agentName}</p>
                      <p className="text-xs text-[var(--color-ink-faint)]">
                        {new Date(r.createdAt).toLocaleString('es-CL', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="mt-1 truncate text-sm text-[var(--color-ink-soft)]">{stripMarkdown(r.summary)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href={`/dashboard/reports/${r.id}`}
                        className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink-soft)] hover:border-[var(--color-violet)] hover:text-[var(--color-violet)]"
                      >
                        Ver
                      </Link>
                      <a
                        href={`/dashboard/reports/${r.id}/download`}
                        className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink-soft)] hover:border-[var(--color-violet)] hover:text-[var(--color-violet)]"
                      >
                        Descargar
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
