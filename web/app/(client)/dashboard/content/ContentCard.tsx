'use client';

import { useState, useTransition } from 'react';
import { AgentAvatar } from '../../../../components/AgentAvatar';
import type { AgentKey } from '../../../../components/marketing/AgentIcon';
import { NetworkBadge } from './NetworkBadge';
import { approveContentAction, rejectContentAction } from './actions';

export function ContentCard({
  id,
  agentSlug,
  channel,
  contentText,
  scheduledFor,
  requestedAt,
}: {
  id: string;
  agentSlug: string;
  channel: string;
  contentText: string;
  scheduledFor: string | null;
  requestedAt: string;
}) {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handle(action: (id: string, notes: string) => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action(id, notes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error inesperado.');
      }
    });
  }

  const when = scheduledFor ? new Date(scheduledFor) : null;

  return (
    <article className="card overflow-hidden p-0">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-soft)] px-5 py-3">
        <div className="flex items-center gap-2.5">
          <AgentAvatar agent={agentSlug as AgentKey} size={32} animated={false} />
          <NetworkBadge channel={channel} />
        </div>
        {when ? (
          <div className="text-right text-xs text-[var(--color-ink-soft)]">
            <p className="font-semibold text-[var(--color-ink)]">
              {when.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
            <p>{when.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        ) : (
          <span className="text-xs text-[var(--color-ink-faint)]">Sin fecha programada</span>
        )}
      </div>

      <div className="p-5">
        <div className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface-sunken)] p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-ink)]">{contentText}</p>
        </div>
        <p className="mt-2 text-xs text-[var(--color-ink-faint)]">
          Propuesto el {new Date(requestedAt).toLocaleString('es-CL')}
        </p>

        <input
          type="text"
          placeholder="Nota (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-3 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-1.5 text-sm text-[var(--color-ink)] outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-violet)]/40"
        />
        {error && <p className="mt-2 text-xs font-medium text-[var(--color-critical)]">{error}</p>}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => handle(approveContentAction)}
            className="rounded-full px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'var(--color-good)' }}
          >
            Aprobar
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handle(rejectContentAction)}
            className="rounded-full border border-[var(--color-border)] px-4 py-1.5 text-sm font-semibold text-[var(--color-ink-soft)] hover:border-[var(--color-critical)] hover:text-[var(--color-critical)] disabled:opacity-50"
          >
            Rechazar
          </button>
        </div>
      </div>
    </article>
  );
}
