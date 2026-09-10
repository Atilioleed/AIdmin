'use client';

import { useState, useTransition } from 'react';
import { approveApprovalAction, rejectApprovalAction } from './actions.js';

const ACTION_TYPE_LABEL: Record<string, string> = {
  payment: 'Pago',
  spend: 'Gasto',
  budget_change: 'Cambio de presupuesto',
  paid_campaign_launch: 'Campaña paga',
};

export function ApprovalCard({
  id,
  agentSlug,
  actionType,
  payload,
  requestedAt,
}: {
  id: string;
  agentSlug: string;
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
    <article className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
          {ACTION_TYPE_LABEL[actionType] ?? actionType}
        </span>
        <span className="text-xs text-neutral-400">
          {agentSlug} · {new Date(requestedAt).toLocaleString('es-CL')}
        </span>
      </div>
      <pre className="mb-3 overflow-x-auto rounded bg-neutral-50 p-3 text-xs text-neutral-700">
        {JSON.stringify(payload, null, 2)}
      </pre>
      <input
        type="text"
        placeholder="Nota (opcional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="mb-2 w-full rounded border border-neutral-300 px-2 py-1 text-sm"
      />
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => handle(approveApprovalAction)}
          className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Aprobar
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handle(rejectApprovalAction)}
          className="rounded bg-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-800 hover:bg-neutral-300 disabled:opacity-50"
        >
          Rechazar
        </button>
      </div>
    </article>
  );
}
