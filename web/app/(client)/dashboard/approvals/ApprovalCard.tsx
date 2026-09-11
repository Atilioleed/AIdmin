'use client';

import { useState, useTransition } from 'react';
import { approveApprovalAction, rejectApprovalAction } from './actions';

const ACTION_TYPE_LABEL: Record<string, string> = {
  payment: 'Pago',
  spend: 'Gasto',
  budget_change: 'Cambio de presupuesto',
  paid_campaign_launch: 'Campaña paga',
};

function formatPayloadValue(value: unknown): string {
  if (typeof value === 'number') return value.toLocaleString('es-CL');
  return String(value);
}

export function ApprovalCard({
  id,
  actionType,
  payload,
  requestedAt,
}: {
  id: string;
  actionType: string;
  payload: Record<string, unknown>;
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

  return (
    <article className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <span
          className="rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ background: 'var(--color-warn-bg)', color: 'var(--color-warn)' }}
        >
          {ACTION_TYPE_LABEL[actionType] ?? actionType}
        </span>
        <span className="text-xs text-[var(--color-ink-faint)]">{new Date(requestedAt).toLocaleString('es-CL')}</span>
      </div>

      <dl className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-lg bg-[var(--color-surface-sunken)] p-3 text-sm sm:grid-cols-3">
        {Object.entries(payload).map(([key, value]) => (
          <div key={key}>
            <dt className="text-[11px] uppercase tracking-wide text-[var(--color-ink-faint)]">{key}</dt>
            <dd className="text-[var(--color-ink)]">{formatPayloadValue(value)}</dd>
          </div>
        ))}
      </dl>

      <input
        type="text"
        placeholder="Nota (opcional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="mb-3 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-1.5 text-sm text-[var(--color-ink)] outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-violet)]/40"
      />
      {error && <p className="mb-2 text-xs font-medium text-[var(--color-critical)]">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => handle(approveApprovalAction)}
          className="rounded-full px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: 'var(--color-good)' }}
        >
          Aprobar
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handle(rejectApprovalAction)}
          className="rounded-full border border-[var(--color-border)] px-4 py-1.5 text-sm font-semibold text-[var(--color-ink-soft)] hover:border-[var(--color-critical)] hover:text-[var(--color-critical)] disabled:opacity-50"
        >
          Rechazar
        </button>
      </div>
    </article>
  );
}
