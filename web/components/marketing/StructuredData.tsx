import { FAQ_ITEMS } from './Faq';
import { PLAN_PRICES_CLP } from '../../lib/plans';

const SITE_URL = 'https://aidmin.cl';

/**
 * JSON-LD de la landing: SoftwareApplication (AIdmin es un SaaS, no un negocio con
 * local fisico - "LocalBusiness" no aplica aca, se usa en cambio para el sitio
 * publico de cada pyme cliente, ver components/site-templates/SiteRenderer.tsx) +
 * FAQPage generado a partir del mismo contenido que se ve en pantalla (Faq.tsx),
 * para que nunca queden desincronizados.
 */
export function MarketingStructuredData() {
  const softwareApplication = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AIdmin',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'Seis gerentes de inteligencia artificial que trabajan todos los días en tu pyme — marketing, finanzas, producto, legal, desarrollo y un CEO que preside el comité — con aprobación humana en cada gasto y publicación.',
    url: SITE_URL,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'CLP',
      lowPrice: Math.min(...Object.values(PLAN_PRICES_CLP)),
      highPrice: Math.max(...Object.values(PLAN_PRICES_CLP)),
      offerCount: Object.keys(PLAN_PRICES_CLP).length,
    },
    provider: {
      '@type': 'Organization',
      name: 'AIdmin',
      email: 'hola@aidmin.cl',
      telephone: '+56942668165',
      url: SITE_URL,
    },
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplication) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
    </>
  );
}
