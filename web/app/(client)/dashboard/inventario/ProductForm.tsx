'use client';

import { useRef, useState, useTransition } from 'react';
import { createProductAction } from './actions';

export function ProductForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createProductAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="grid grid-cols-1 gap-3 rounded-lg border border-neutral-200 bg-white p-4 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Nombre</label>
        <input name="name" required className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Precio (CLP)</label>
        <input name="priceClp" type="number" min="0" required className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm" />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-neutral-600">Descripción</label>
        <textarea name="description" rows={2} className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Stock</label>
        <input name="stockQuantity" type="number" min="0" defaultValue={0} className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Stock de seguridad</label>
        <input
          name="safetyStockThreshold"
          type="number"
          min="0"
          defaultValue={0}
          className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
        />
        <p className="mt-1 text-xs text-neutral-400">Tu Gerente de Producto avisa cuando el stock cae a este nivel o menos.</p>
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-neutral-600">Fotos</label>
        <input type="file" name="photos" accept="image/*" multiple className="w-full text-sm" />
      </div>
      {error && <p className="text-xs text-red-600 sm:col-span-2">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 sm:col-span-2"
      >
        {isPending ? 'Guardando…' : 'Agregar producto'}
      </button>
    </form>
  );
}
