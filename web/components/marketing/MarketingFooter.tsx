import Link from 'next/link';
import { Logo } from '../Logo';

const SITE_LINKS = [
  { href: '#que-es', label: 'Qué es AIdmin' },
  { href: '#gerentes', label: 'Gerentes IA' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#precios', label: 'Precios' },
  { href: '#faq', label: 'Preguntas frecuentes' },
  { href: '#nosotros', label: 'Nosotros' },
];

const LEGAL_LINKS = [
  { href: '/terminos', label: 'Términos y condiciones' },
  { href: '/privacidad', label: 'Política de privacidad' },
];

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 8.5h2V5.3c-.35-.05-1.54-.15-2.94-.15-2.91 0-4.9 1.78-4.9 5.04v2.66H6.2v3.6h2.96V21h3.72v-6.55h2.84l.45-3.6h-3.29V10.5c0-1.04.28-1.75 1.79-1.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function MarketingFooter() {
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL;
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
  const hasSocial = Boolean(facebookUrl || instagramUrl);

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <nav aria-label="Mapa del sitio" className="flex flex-wrap justify-center gap-x-6 gap-y-2 sm:justify-start">
            {SITE_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-xs font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-violet)]">
                {l.label}
              </a>
            ))}
          </nav>
          {hasSocial && (
            <div className="flex items-center gap-3">
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="AIdmin en Facebook"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink-faint)] transition-colors hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-violet)]"
                >
                  <FacebookIcon />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="AIdmin en Instagram"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink-faint)] transition-colors hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-coral)]"
                >
                  <InstagramIcon />
                </a>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border-soft)] pt-6 sm:flex-row">
          <Logo size="sm" />
          <div className="flex flex-col items-center gap-1 text-xs text-[var(--color-ink-faint)] sm:items-end">
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-end">
              <a href="mailto:hola@aidmin.cl" className="hover:text-[var(--color-ink-soft)]">
                hola@aidmin.cl
              </a>
              <span aria-hidden="true">·</span>
              <a href="https://wa.me/56942668165" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-ink-soft)]">
                +56 9 4266 8165
              </a>
            </p>
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-end">
              {LEGAL_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="hover:text-[var(--color-ink-soft)]">
                  {l.label}
                </Link>
              ))}
            </p>
            <p>© {new Date().getFullYear()} AIdmin — gerentes de inteligencia artificial para pymes.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
