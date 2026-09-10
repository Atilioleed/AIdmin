export interface TenantSiteProduct {
  id: string;
  name: string;
  description: string | null;
  priceClp: number;
  photoUrl: string | null;
}

export interface TenantSiteContent {
  businessName: string;
  tagline: string;
  logoUrl: string | null;
  colors: { primary: string; secondary: string; background: string };
  about: string;
  products: TenantSiteProduct[];
  contact: {
    instagram: string;
    facebook: string;
    tiktok: string;
    linkedin: string;
    xTwitter: string;
    youtube: string;
    website: string;
  };
}

export type HeroLayout = 'centered' | 'split' | 'overlay';
export type HeadingFont = 'display-serif' | 'display-sans-bold' | 'display-sans-tight';
export type CardStyle = 'rounded' | 'sharp' | 'bordered';
export type Density = 'airy' | 'compact';

export interface SiteTemplateConfig {
  slug: string;
  heroLayout: HeroLayout;
  headingFont: HeadingFont;
  cardStyle: CardStyle;
  density: Density;
  showProductsFirst: boolean;
  eyebrow: string;
}

export function formatClp(amount: number): string {
  return amount.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
}

export function headingFontClass(font: HeadingFont): string {
  switch (font) {
    case 'display-serif':
      return 'font-display font-semibold';
    case 'display-sans-bold':
      return 'font-sans font-extrabold tracking-tight';
    case 'display-sans-tight':
      return 'font-sans font-semibold tracking-wide uppercase';
  }
}

export function cardStyleClass(style: CardStyle): string {
  switch (style) {
    case 'rounded':
      return 'rounded-2xl border border-black/5 shadow-sm';
    case 'sharp':
      return 'rounded-none border border-black/10';
    case 'bordered':
      return 'rounded-md border-2';
  }
}
