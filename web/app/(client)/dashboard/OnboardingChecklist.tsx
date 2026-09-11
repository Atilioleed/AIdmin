import Link from 'next/link';
import { getBusinessContext } from '../../../lib/business-context';
import { getTenantWebsite } from '../../../lib/tenant-websites';
import { getSocialLinks } from '../../../lib/social-links';
import { listProducts } from '../../../lib/products';

export async function OnboardingChecklist({ tenantId, termsAcceptedAt }: { tenantId: string; termsAcceptedAt: Date | null }) {
  const [businessContext, website, socialLinks, products] = await Promise.all([
    getBusinessContext(tenantId),
    getTenantWebsite(tenantId),
    getSocialLinks(tenantId),
    listProducts(tenantId),
  ]);

  const needsInventory = businessContext.businessType === 'producto' || businessContext.businessType === 'mixto';

  const steps = [
    { label: 'Aceptar contrato', href: '/dashboard', done: Boolean(termsAcceptedAt) },
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
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-sm font-semibold text-[var(--color-ink)]">Configura tu pyme</p>
        <span className="rounded-full bg-[var(--color-surface-sunken)] px-2 py-0.5 text-xs font-semibold text-[var(--color-ink-faint)]">
          {doneCount}/{steps.length}
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {steps.map((step) => (
          <li key={step.href}>
            <Link href={step.href} className="group flex items-center gap-2.5 text-sm">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] text-white"
                style={
                  step.done
                    ? { background: 'var(--gradient-brand)' }
                    : { border: '1.5px solid var(--color-border)', color: 'transparent' }
                }
              >
                ✓
              </span>
              <span className={step.done ? 'text-[var(--color-ink-faint)] line-through' : 'text-[var(--color-ink-soft)] group-hover:text-[var(--color-violet)]'}>
                {step.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
