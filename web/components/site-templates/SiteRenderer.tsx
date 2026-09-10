import { About } from './About';
import { ContactFooter } from './ContactFooter';
import { Hero } from './Hero';
import { ProductGrid } from './ProductGrid';
import type { SiteTemplateConfig, TenantSiteContent } from './types';

export function SiteRenderer({ content, config }: { content: TenantSiteContent; config: SiteTemplateConfig }) {
  const middle = (
    <>
      <About content={content} />
      <ProductGrid content={content} cardStyle={config.cardStyle} />
    </>
  );

  return (
    <div style={{ background: content.colors.background }} className="min-h-screen text-neutral-900">
      <Hero content={content} layout={config.heroLayout} headingFont={config.headingFont} eyebrow={config.eyebrow} />
      <div className={config.density === 'compact' ? 'divide-y divide-neutral-100' : ''}>
        {config.showProductsFirst ? (
          <>
            <ProductGrid content={content} cardStyle={config.cardStyle} />
            <About content={content} />
          </>
        ) : (
          middle
        )}
      </div>
      <ContactFooter content={content} />
    </div>
  );
}
