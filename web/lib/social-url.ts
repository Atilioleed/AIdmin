type Platform = 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'xTwitter' | 'youtube' | 'website';

const BASE_URL: Record<Exclude<Platform, 'website'>, string> = {
  instagram: 'https://instagram.com/',
  facebook: 'https://facebook.com/',
  tiktok: 'https://tiktok.com/@',
  linkedin: 'https://linkedin.com/',
  xTwitter: 'https://x.com/',
  youtube: 'https://youtube.com/',
};

/**
 * Los campos de /dashboard/redes se cargan a mano y llegan en formatos mixtos
 * (handle con @, dominio sin protocolo, URL completa). schema.org exige que
 * "sameAs" sean URLs absolutas de verdad - esta funcion normaliza cada campo a
 * una URL valida (o null si esta vacio) antes de emitirlo en JSON-LD.
 */
export function toAbsoluteSocialUrl(platform: Platform, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-z0-9-]+\.[a-z]{2,}(\/|$)/i.test(trimmed)) return `https://${trimmed}`;

  if (platform === 'website') return `https://${trimmed.replace(/^\/+/, '')}`;

  const handle = trimmed.replace(/^@/, '');
  return `${BASE_URL[platform]}${handle}`;
}
