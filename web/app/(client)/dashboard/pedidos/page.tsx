import { redirect } from 'next/navigation';
import { getCurrentTenant } from '../../../../lib/tenant';
import { listOrders } from '../../../../lib/orders';
import { listActiveProducts } from '../../../../lib/products';
import { formatClp } from '../../../../components/site-templates/types';
import { OrderForm } from './OrderForm';
import { OrderStatusControl } from './OrderStatusControl';

export default async function PedidosPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect('/sin-pyme');

  const [orders, products] = await Promise.all([listOrders(tenant.id), listActiveProducts(tenant.id)]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">
          Pedidos de tus <span className="text-gradient-warm">clientes</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink-soft)]">
          Carga los pedidos que te lleguen (WhatsApp, teléfono, redes) y avísale al cliente final
          por correo cada vez que cambie el estado — número de pedido, despacho y entrega, todo en
          un lugar.
        </p>
      </div>

      <OrderForm products={products} />

      {orders.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-[var(--color-ink-faint)]">Todavía no has cargado ningún pedido.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <article key={o.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base font-semibold text-[var(--color-ink)]">
                    Pedido #{o.orderNumber} — {o.customerName}
                  </p>
                  <p className="text-xs text-[var(--color-ink-faint)]">
                    {new Date(o.createdAt).toLocaleString('es-CL')}
                    {o.customerPhone ? ` · ${o.customerPhone}` : ''}
                    {o.customerEmail ? ` · ${o.customerEmail}` : ' · sin correo (no se avisa automático)'}
                  </p>
                  {o.shippingAddress && <p className="mt-1 text-xs text-[var(--color-ink-faint)]">{o.shippingAddress}</p>}
                </div>
                <OrderStatusControl orderId={o.id} status={o.status} trackingInfo={o.trackingInfo} hasEmail={Boolean(o.customerEmail)} />
              </div>

              <div className="mt-3 rounded-lg bg-[var(--color-surface-sunken)] p-3">
                {o.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm text-[var(--color-ink-soft)]">
                    <span>
                      {item.quantity} × {item.name}
                    </span>
                    <span>{formatClp(item.quantity * item.unitPriceClp)}</span>
                  </div>
                ))}
                <div className="mt-2 flex justify-between border-t border-[var(--color-border-soft)] pt-2 text-sm font-semibold text-[var(--color-ink)]">
                  <span>Total</span>
                  <span>{formatClp(o.totalClp)}</span>
                </div>
              </div>
              {o.notes && <p className="mt-2 text-xs text-[var(--color-ink-faint)]">{o.notes}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
