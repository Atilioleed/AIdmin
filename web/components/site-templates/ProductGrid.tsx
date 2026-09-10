import type { CardStyle, TenantSiteContent } from './types';
import { cardStyleClass, formatClp } from './types';

export function ProductGrid({ content, cardStyle }: { content: TenantSiteContent; cardStyle: CardStyle }) {
  if (content.products.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Productos</h2>
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {content.products.map((product) => (
          <article key={product.id} className={`overflow-hidden bg-white ${cardStyleClass(cardStyle)}`}>
            <div className="flex aspect-square items-center justify-center bg-neutral-100">
              {product.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.photoUrl} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm text-neutral-400">Sin foto</span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-neutral-900">{product.name}</h3>
              {product.description && (
                <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{product.description}</p>
              )}
              <p className="mt-2 font-semibold" style={{ color: content.colors.primary }}>
                {formatClp(product.priceClp)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
