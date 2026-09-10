import Link from 'next/link';
import { Logo } from '../Logo';

const LINKS = [
  { href: '#gerentes', label: 'Gerentes IA' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#precios', label: 'Precios' },
];

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[var(--color-violet-night)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/">
          <Logo size="sm" muted />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-white/65 transition-colors hover:text-white">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="hidden text-sm font-semibold text-white/80 hover:text-white sm:block">
            Ingresar
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--color-violet-night)] shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(120deg, var(--color-gold), var(--color-orange))' }}
          >
            Empieza ahora
          </Link>
        </div>
      </div>
    </header>
  );
}
