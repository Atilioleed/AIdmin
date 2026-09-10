'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateDailyCapAction } from './actions';

export function CapForm({ tenantId, capTokens }: { tenantId: string; capTokens: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateDailyCapAction(tenantId, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">
          Tope de tokens por agente, por día
        </label>
        <input
          name="capTokens"
          type="number"
          min={1000}
          step={1000}
          defaultValue={capTokens}
          className="w-40 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-violet)]/40"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-50"
        style={{ background: 'var(--gradient-brand)' }}
      >
        {isPending ? 'Guardando…' : 'Guardar tope'}
      </button>
      {error && <p className="w-full text-xs font-medium text-[var(--color-critical)]">{error}</p>}
    </form>
  );
}
