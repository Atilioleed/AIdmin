import { redirect } from 'next/navigation';
import { getCurrentTenant } from '../../../../lib/tenant';
import { getSocialLinks } from '../../../../lib/social-links';
import { SocialLinksForm } from './SocialLinksForm';
import { MetricoolConnect } from './MetricoolConnect';

export default async function RedesPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect('/sin-pyme');

  const links = await getSocialLinks(tenant.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">Redes sociales</h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink-soft)]">
          Tu Gerente de Marketing usa esto como referencia. Conecta Metricool para que además
          trabaje con datos y calendario reales, no solo estos enlaces.
        </p>
      </div>

      <MetricoolConnect isConnected={links.isMetricoolConnected} connectedAt={links.metricoolConnectedAt} />

      <SocialLinksForm links={links} />
    </div>
  );
}
