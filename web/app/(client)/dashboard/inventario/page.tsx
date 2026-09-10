import { redirect } from 'next/navigation';
import Image from 'next/image';
import { getCurrentTenant } from '../../../../lib/tenant';
import { getBusinessContext } from '../../../../lib/business-context';
import { listProducts } from '../../../../lib/products';
import { formatClp } from '../../../../components/site-templates/types';
import { ProductForm } from './ProductForm';
import { ToggleActiveButton } from './ToggleActiveButton';

export default async function InventarioPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect('/sin-pyme');

  const businessContext = await getBusinessContext(tenant.id);

  if (businessContext.businessType === 'servicio') {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="text-lg font-semibold text-neutral-900">Inventario</h1>
        <p className="mt-2 rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">
          Marcaste en <a href="/dashboard/negocio" className="underline">Negocio</a> que tu pyme es solo de
          servicios, así que no necesitas inventario. Si eso cambia, actualízalo ahí.
        </p>
      </div>
    );
  }

  if (!businessContext.businessType) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="text-lg font-semibold text-neutral-900">Inventario</h1>
        <p className="mt-2 rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">
          Primero completa &ldquo;¿Qué vendes?&rdquo; en{' '}
          <a href="/dashboard/negocio" className="underline">Negocio</a> para saber si te corresponde
          inventario.
        </p>
      </div>
    );
  }

  const products = await listProducts(tenant.id);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Inventario</h1>
        <p className="text-sm text-neutral-500">
          Producto, precio, stock y stock de seguridad. Tu Gerente de Producto avisa
          cuando algo cae bajo su umbral, y lo que marques activo aparece en tu sitio.
        </p>
      </div>

      <ProductForm />

      <div className="flex flex-col gap-3">
        {products.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">
            Todavía no cargaste productos.
          </p>
        ) : (
          products.map((p) => (
            <article key={p.id} className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3">
              {p.photoStoragePaths[0] ? (
                <Image
                  src={`/${p.photoStoragePaths[0]}`}
                  alt={p.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded bg-neutral-100 text-xs text-neutral-400">
                  Sin foto
                </div>
              )}
              <div className="flex-1 text-sm">
                <p className="font-medium text-neutral-900">{p.name}</p>
                <p className="text-neutral-500">
                  {formatClp(p.priceClp)} · stock {p.stockQuantity}
                  {p.stockQuantity <= p.safetyStockThreshold && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                      Stock bajo
                    </span>
                  )}
                </p>
              </div>
              <ToggleActiveButton productId={p.id} isActive={p.isActive} />
            </article>
          ))
        )}
      </div>
    </div>
  );
}
