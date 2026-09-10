import { notFound } from 'next/navigation';
import { getPublishedTenantWebsiteBySlug } from '../../../lib/tenant-websites';
import { buildTenantSiteContent } from '../../../lib/site-content';
import { getSiteTemplateConfig } from '../../../components/site-templates/registry';
import { SiteRenderer } from '../../../components/site-templates/SiteRenderer';

export default async function TenantSitePage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const record = await getPublishedTenantWebsiteBySlug(tenantSlug);
  if (!record) notFound();

  const content = await buildTenantSiteContent(record.tenantId, record.tenantName, record.website);
  const config = getSiteTemplateConfig(record.website.templateSlug);

  return <SiteRenderer content={content} config={config} />;
}
