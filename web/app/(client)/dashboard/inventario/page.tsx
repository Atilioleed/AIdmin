import { redirect } from 'next/navigation';
import { getCurrentTenant } from '../../../../lib/tenant';
import { getBusinessContext } from '../../../../lib/business-context';
import { listProducts } from '../../../../lib/products';
import { formatClp } from '../../../../components/site-templates/types';
import { ProductForm } from './ProductForm';
import { ToggleActiveButton } from './ToggleActiveButton';
import { PhotoGallery } from './PhotoGallery';

export default async function InventarioPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect('/sin-pyme');

  const businessContext = await getBusinessContext(tenant.id);

  if (businessContext.businessType === 'servicio') {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">Inventario</h1>
        <div className="card mt-4 p-8 text-center">
          <p className="text-sm text-[var(--color-ink-faint)]">
            Marcaste en{' '}
            <a href="/dashboard/negocio" className="font-semibold text-[var(--color-violet)]">
              Negocio
            </a>{' '}
            que tu pyme es solo de servicios, así que no necesitas inventario. Si eso cambia, actualízalo ahí.
          </p>
        </div>
      </div>
    );
  }

  if (!businessContext.businessType) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">Inventario</h1>
        <div className="card mt-4 p-8 text-center">
          <p className="text-sm text-[var(--color-ink-faint)]">
            Primero completa &ldquo;¿Qué vendes?&rdquo; en{' '}
            <a href="/dashboard/negocio" className="font-semibold text-[var(--color-violet)]">
              Negocio
            </a>{' '}
            para saber si te corresponde inventario.
          </p>
        </div>
      </div>
    );
  }

  const products = await listProducts(tenant.id);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">Inventario</h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink-soft)]">
          Producto, fotos, precio y stock. Tu Gerente de Producto avisa cuando algo cae bajo su
          umbral, y lo que marques activo aparece en tu sitio.
        </p>
      </div>

      <ProductForm />

      <div className="flex flex-col gap-3">
        {products.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-[var(--color-ink-faint)]">Todavía no cargaste productos.</p>
          </div>
        ) : (
          products.map((p) => {
            const margin = p.costPriceClp !== null ? p.priceClp - p.costPriceClp : null;
            return (
              <article key={p.id} className="card flex items-center gap-4 p-4">
                <PhotoGallery productId={p.id} photoStoragePaths={p.photoStoragePaths} coverPhotoIndex={p.coverPhotoIndex} />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium text-[var(--color-ink)]">{p.name}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[var(--color-ink-soft)]">
                    <span className="font-semibold text-[var(--color-ink)]">{formatClp(p.priceClp)}</span>
                    <span className="text-[var(--color-ink-faint)]">· stock {p.stockQuantity}</span>
                    {margin !== null && (
                      <span className="text-xs text-[var(--color-ink-faint)]">· margen {formatClp(margin)}</span>
                    )}
                    {p.stockQuantity <= p.safetyStockThreshold && (
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ background: 'var(--color-warn-bg)', color: 'var(--color-warn)' }}
                      >
                        Stock bajo
                      </span>
                    )}
                  </p>
                </div>
                <ToggleActiveButton productId={p.id} isActive={p.isActive} />
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
