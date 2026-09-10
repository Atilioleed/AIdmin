import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedTenantWebsiteBySlug } from '../../../lib/tenant-websites';
import { buildTenantSiteContent } from '../../../lib/site-content';
import { getSiteTemplateConfig } from '../../../components/site-templates/registry';
import { SiteRenderer } from '../../../components/site-templates/SiteRenderer';
import { toAbsoluteSocialUrl } from '../../../lib/social-url';

type PageParams = { params: Promise<{ tenantSlug: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { tenantSlug } = await params;
  const record = await getPublishedTenantWebsiteBySlug(tenantSlug);
  if (!record) return { title: 'Sitio no encontrado', robots: { index: false } };

  const content = await buildTenantSiteContent(record.tenantId, record.tenantName, record.website);
  const title = content.tagline ? `${content.businessName} — ${content.tagline}` : content.businessName;
  const description = content.about?.slice(0, 160) || `Sitio web de ${content.businessName}, hecho con AIdmin.`;

  return {
    title,
    description,
    alternates: { canonical: `/sitio/${tenantSlug}` },
    openGraph: { title, description, type: 'website' },
  };
}

export default async function TenantSitePage({ params }: PageParams) {
  const { tenantSlug } = await params;
  const record = await getPublishedTenantWebsiteBySlug(tenantSlug);
  if (!record) notFound();

  const content = await buildTenantSiteContent(record.tenantId, record.tenantName, record.website);
  const config = getSiteTemplateConfig(record.website.templateSlug);

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: content.businessName,
    description: content.about || content.tagline || undefined,
    image: content.logoUrl || undefined,
    sameAs: [
      toAbsoluteSocialUrl('instagram', content.contact.instagram),
      toAbsoluteSocialUrl('facebook', content.contact.facebook),
      toAbsoluteSocialUrl('tiktok', content.contact.tiktok),
      toAbsoluteSocialUrl('linkedin', content.contact.linkedin),
      toAbsoluteSocialUrl('xTwitter', content.contact.xTwitter),
      toAbsoluteSocialUrl('youtube', content.contact.youtube),
      toAbsoluteSocialUrl('website', content.contact.website),
    ].filter((url): url is string => url !== null),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
      <SiteRenderer content={content} config={config} />
    </>
  );
}
