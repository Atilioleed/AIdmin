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
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium disabled:opacity-50 ${
        isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'
      }`}
    >
      {isActive ? 'Activo' : 'Inactivo'}
    </button>
  );
}
