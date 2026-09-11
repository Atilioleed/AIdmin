'use client';

import { useRef, useState, useTransition } from 'react';
import { createProductAction } from './actions';

const inputClass =
  'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-violet)]/40';
const labelClass = 'mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]';

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
    <form ref={formRef} action={handleSubmit} className="card grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
      <div>
        <label className={labelClass}>Nombre</label>
        <input name="name" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Precio de venta (CLP)</label>
        <input name="priceClp" type="number" min="0" required className={inputClass} />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>Descripción</label>
        <textarea name="description" rows={2} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>
          Precio de costo (CLP) <span className="font-normal text-[var(--color-ink-faint)]">(opcional)</span>
        </label>
        <input name="costPriceClp" type="number" min="0" className={inputClass} placeholder="Lo que te cuesta a ti" />
        <p className="mt-1 text-xs text-[var(--color-ink-faint)]">Solo lo ves tú — sirve para que Finanzas calcule tu margen real.</p>
      </div>
      <div>
        <label className={labelClass}>Stock</label>
        <input name="stockQuantity" type="number" min="0" defaultValue={0} className={inputClass} />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>Stock de seguridad</label>
        <input name="safetyStockThreshold" type="number" min="0" defaultValue={0} className={inputClass} />
        <p className="mt-1 text-xs text-[var(--color-ink-faint)]">Tu Gerente de Producto avisa cuando el stock cae a este nivel o menos.</p>
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>Fotos</label>
        <input type="file" name="photos" accept="image/*" multiple className="w-full text-sm" />
        <p className="mt-1 text-xs text-[var(--color-ink-faint)]">Puedes subir varias — después eliges cuál es la foto de portada.</p>
      </div>
      {error && <p className="text-xs font-medium text-[var(--color-critical)] sm:col-span-2">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-50 sm:col-span-2"
        style={{ background: 'var(--gradient-brand)' }}
      >
        {isPending ? 'Guardando…' : 'Agregar producto'}
      </button>
    </form>
  );
}
