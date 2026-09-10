'use client';

import { useState, useTransition } from 'react';
import { approveContentAction, rejectContentAction } from './actions.js';

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

  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800">
          {channel}
        </span>
        <span className="text-xs text-neutral-400">
          {agentSlug} · {new Date(requestedAt).toLocaleString('es-CL')}
        </span>
      </div>
      <p className="mb-3 whitespace-pre-wrap text-sm text-neutral-800">{contentText}</p>
      {scheduledFor && (
        <p className="mb-3 text-xs text-neutral-500">
          Programado para {new Date(scheduledFor).toLocaleString('es-CL')}
        </p>
      )}
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
          onClick={() => handle(approveContentAction)}
          className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Aprobar
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handle(rejectContentAction)}
          className="rounded bg-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-800 hover:bg-neutral-300 disabled:opacity-50"
        >
          Rechazar
        </button>
      </div>
    </article>
  );
}
