'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import type { Product } from '../../../../lib/products';
import { formatClp } from '../../../../components/site-templates/types';
import { createOrderAction } from './actions';

const inputClass =
  'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-violet)]/40';
const labelClass = 'mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]';

export function OrderForm({ products }: { products: Product[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const items = useMemo(
    () =>
      products
        .filter((p) => (quantities[p.id] ?? 0) > 0)
        .map((p) => ({ productId: p.id, name: p.name, quantity: quantities[p.id], unitPriceClp: p.priceClp })),
    [products, quantities],
  );
  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPriceClp, 0);

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set('itemsJson', JSON.stringify(items));
    startTransition(async () => {
      const result = await createOrderAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
      setQuantities({});
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="card flex flex-col gap-4 p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nombre del cliente</label>
          <input name="customerName" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Teléfono</label>
          <input name="customerPhone" className={inputClass} placeholder="+56 9 1234 5678" />
        </div>
        <div>
          <label className={labelClass}>
            Correo del cliente <span className="font-normal text-[var(--color-ink-faint)]">(para avisarle por correo)</span>
          </label>
          <input name="customerEmail" type="email" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Dirección de entrega</label>
          <input name="shippingAddress" className={inputClass} />
        </div>
      </div>

      {products.length > 0 && (
        <div>
          <label className={labelClass}>Productos</label>
          <div className="flex flex-col divide-y divide-[var(--color-border-soft)] rounded-lg border border-[var(--color-border)]">
            {products.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm text-[var(--color-ink)]">{p.name}</p>
                  <p className="text-xs text-[var(--color-ink-faint)]">{formatClp(p.priceClp)}</p>
                </div>
                <input
                  type="number"
                  min={0}
                  value={quantities[p.id] ?? 0}
                  onChange={(e) => setQuantities((prev) => ({ ...prev, [p.id]: Math.max(0, Number(e.target.value)) }))}
                  className="w-16 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-2 py-1 text-center text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className={labelClass}>Notas</label>
        <textarea name="notes" rows={2} className={inputClass} placeholder="Ej: llegó por WhatsApp, pidió envoltorio de regalo" />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--color-ink)]">Total: {formatClp(total)}</p>
        <button
          type="submit"
          disabled={isPending || items.length === 0}
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-50"
          style={{ background: 'var(--gradient-brand)' }}
        >
          {isPending ? 'Creando…' : 'Crear pedido'}
        </button>
      </div>
      {error && <p className="text-xs font-medium text-[var(--color-critical)]">{error}</p>}
    </form>
  );
}
