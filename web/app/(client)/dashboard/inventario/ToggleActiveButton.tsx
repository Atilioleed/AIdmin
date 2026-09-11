'use client';

import { useTransition } from 'react';
import { toggleProductActiveAction } from './actions';

export function ToggleActiveButton({ productId, isActive }: { productId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => toggleProductActiveAction(productId, !isActive))}
      className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold disabled:opacity-50"
      style={
        isActive
          ? { background: 'var(--color-good-bg)', color: 'var(--color-good)' }
          : { background: 'var(--color-surface-sunken)', color: 'var(--color-ink-faint)' }
      }
    >
      {isActive ? 'Activo' : 'Inactivo'}
    </button>
  );
}
