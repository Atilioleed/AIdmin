import type { SiteTemplateConfig } from './types';

// Composicion visual de cada una de las 10 plantillas (ver db/seed.sql para
// nombre/descripcion/categoria, que vive en website_templates). Un slug sin
// entrada aca cae al default al final del archivo.
export const SITE_TEMPLATE_REGISTRY: Record<string, SiteTemplateConfig> = {
  'minimal-studio': {
    slug: 'minimal-studio',
    heroLayout: 'centered',
    headingFont: 'display-serif',
    cardStyle: 'sharp',
    density: 'airy',
    showProductsFirst: false,
    eyebrow: 'Estudio',
  },
  'retail-catalogo': {
    slug: 'retail-catalogo',
    heroLayout: 'split',
    headingFont: 'display-sans-bold',
    cardStyle: 'rounded',
    density: 'compact',
    showProductsFirst: true,
    eyebrow: 'Tienda',
  },
  gastronomia: {
    slug: 'gastronomia',
    heroLayout: 'overlay',
    headingFont: 'display-serif',
    cardStyle: 'rounded',
    density: 'airy',
    showProductsFirst: true,
    eyebrow: 'Menú',
  },
  'servicios-profesionales': {
    slug: 'servicios-profesionales',
    heroLayout: 'split',
    headingFont: 'display-sans-tight',
    cardStyle: 'bordered',
    density: 'compact',
    showProductsFirst: false,
    eyebrow: 'Servicios profesionales',
  },
  boutique: {
    slug: 'boutique',
    heroLayout: 'overlay',
    headingFont: 'display-serif',
    cardStyle: 'sharp',
    density: 'airy',
    showProductsFirst: true,
    eyebrow: 'Colección',
  },
  'salud-bienestar': {
    slug: 'salud-bienestar',
    heroLayout: 'centered',
    headingFont: 'display-serif',
    cardStyle: 'rounded',
    density: 'airy',
    showProductsFirst: false,
    eyebrow: 'Bienestar',
  },
  inmobiliaria: {
    slug: 'inmobiliaria',
    heroLayout: 'split',
    headingFont: 'display-sans-bold',
    cardStyle: 'bordered',
    density: 'compact',
    showProductsFirst: true,
    eyebrow: 'Propiedades',
  },
  'educacion-cursos': {
    slug: 'educacion-cursos',
    heroLayout: 'centered',
    headingFont: 'display-sans-bold',
    cardStyle: 'rounded',
    density: 'compact',
    showProductsFirst: true,
    eyebrow: 'Cursos',
  },
  eventos: {
    slug: 'eventos',
    heroLayout: 'overlay',
    headingFont: 'display-sans-tight',
    cardStyle: 'sharp',
    density: 'airy',
    showProductsFirst: false,
    eyebrow: 'Evento',
  },
  'portafolio-creativo': {
    slug: 'portafolio-creativo',
    heroLayout: 'split',
    headingFont: 'display-sans-tight',
    cardStyle: 'sharp',
    density: 'airy',
    showProductsFirst: true,
    eyebrow: 'Portafolio',
  },
};

const DEFAULT_CONFIG: SiteTemplateConfig = {
  slug: 'default',
  heroLayout: 'centered',
  headingFont: 'display-sans-bold',
  cardStyle: 'rounded',
  density: 'airy',
  showProductsFirst: false,
  eyebrow: 'Bienvenido',
};

export function getSiteTemplateConfig(slug: string): SiteTemplateConfig {
  return SITE_TEMPLATE_REGISTRY[slug] ?? DEFAULT_CONFIG;
}
