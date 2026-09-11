'use client';

import { useEffect, useRef, useState } from 'react';
import { SiteRenderer } from '../../../../components/site-templates/SiteRenderer';
import { getSiteTemplateConfig } from '../../../../components/site-templates/registry';
import type { TenantSiteContent } from '../../../../components/site-templates/types';

const SAMPLE_CONTENT: TenantSiteContent = {
  businessName: 'Tu Negocio',
  tagline: 'Una frase corta que resuma lo que haces',
  logoUrl: null,
  colors: { primary: '#6a4cff', secondary: '#ff8a5b', background: '#ffffff' },
  about: 'Acá va una breve historia de tu negocio: qué resuelves y por qué la gente vuelve.',
  products: [
    { id: '1', name: 'Producto uno', description: 'Descripción corta de ejemplo.', priceClp: 15000, photoUrl: null },
    { id: '2', name: 'Producto dos', description: 'Otra descripción de ejemplo.', priceClp: 22000, photoUrl: null },
    { id: '3', name: 'Producto tres', description: 'Más texto de muestra.', priceClp: 9000, photoUrl: null },
  ],
  contact: { instagram: '@tunegocio', facebook: '', tiktok: '', linkedin: '', xTwitter: '', youtube: '', website: '' },
};

// Ancho/alto "reales" a los que se renderiza el sitio de muestra antes de achicarlo
// con CSS transform - suficiente para mostrar el hero y el arranque del contenido.
const NATURAL_WIDTH = 1280;
const NATURAL_HEIGHT = 860;

/**
 * Miniatura REAL: renderiza el mismo SiteRenderer que usa el sitio publico, con
 * contenido de muestra, achicado con CSS transform - no es una captura estatica ni
 * un mockup dibujado a mano, asi que nunca se desactualiza si se agrega un
 * template nuevo o se cambia uno existente.
 */
export function TemplateThumbnail({ slug }: { slug: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setScale(width / NATURAL_WIDTH);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const config = getSiteTemplateConfig(slug);

  return (
    <div ref={wrapperRef} className="relative w-full overflow-hidden rounded-lg bg-white" style={{ height: NATURAL_HEIGHT * scale }}>
      <div
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{ width: NATURAL_WIDTH, height: NATURAL_HEIGHT, transform: `scale(${scale})` }}
        aria-hidden="true"
      >
        <SiteRenderer content={SAMPLE_CONTENT} config={config} />
      </div>
    </div>
  );
}
