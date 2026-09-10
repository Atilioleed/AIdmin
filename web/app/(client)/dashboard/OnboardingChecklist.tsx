import Link from 'next/link';
import { getBusinessContext } from '../../../lib/business-context';
import { getTenantWebsite } from '../../../lib/tenant-websites';
import { getSocialLinks } from '../../../lib/social-links';
import { listProducts } from '../../../lib/products';

export async function OnboardingChecklist({ tenantId }: { tenantId: string }) {
  const [businessContext, website, socialLinks, products] = await Promise.all([
    getBusinessContext(tenantId),
    getTenantWebsite(tenantId),
    getSocialLinks(tenantId),
    listProducts(tenantId),
  ]);

  const needsInventory = businessContext.businessType === 'producto' || businessContext.businessType === 'mixto';

  const steps = [
    {
      label: 'Contexto de negocio',
      href: '/dashboard/negocio',
      done: Boolean(businessContext.objective || businessContext.productsServices),
    },
    { label: 'Sitio web publicado', href: '/dashboard/sitio', done: Boolean(website?.published) },
    ...(needsInventory
      ? [{ label: 'Inventario', href: '/dashboard/inventario', done: products.length > 0 }]
      : []),
    {
      label: 'Redes sociales',
      href: '/dashboard/redes',
      done: Boolean(socialLinks.instagram || socialLinks.facebook || socialLinks.website),
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-900">Configura tu pyme</p>
        <span className="text-xs text-neutral-400">
          {doneCount}/{steps.length}
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {steps.map((step) => (
          <li key={step.href}>
            <Link
              href={step.href}
              className="flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900"
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                  step.done ? 'bg-emerald-500 text-white' : 'border border-neutral-300 text-transparent'
                }`}
              >
                ✓
              </span>
              <span className={step.done ? 'text-neutral-400 line-through' : ''}>{step.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
