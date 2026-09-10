import Link from 'next/link';

/** CTA fijo, solo visible en móvil (md:hidden) — la nav de escritorio ya cumple ese rol ahí. */
export function MobileStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[var(--color-violet-night)]/95 px-4 py-3 backdrop-blur-sm md:hidden">
      <Link
        href="/sign-up"
        className="block rounded-full px-5 py-3 text-center text-sm font-semibold text-[var(--color-violet-night)] shadow-[var(--shadow-glow)]"
        style={{ background: 'linear-gradient(120deg, var(--color-gold), var(--color-orange))' }}
      >
        Empieza ahora
      </Link>
    </div>
  );
}
