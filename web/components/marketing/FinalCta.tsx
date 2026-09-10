import Link from 'next/link';
import { Reveal } from './Reveal';
import { ShareButton } from './ShareButton';

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <Reveal>
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16"
          style={{ background: 'var(--gradient-hero)' }}
        >
          <div
            className="pointer-events-none absolute -bottom-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-25 blur-3xl animate-drift"
            style={{ background: 'var(--gradient-brand)' }}
            aria-hidden="true"
          />
          <div className="relative">
            <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
              Tu comité <span className="text-gradient-warm">te está esperando</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-white/65">
              Crea tu cuenta y arma tu equipo de gerentes IA hoy mismo. Sin
              permanencia, sin letra chica.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/sign-up"
                className="rounded-full px-7 py-3 text-sm font-semibold text-[var(--color-violet-night)] shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(120deg, var(--color-gold), var(--color-orange))' }}
              >
                Crear mi cuenta
              </Link>
              <Link href="/sign-in" className="text-sm font-semibold text-white/75 hover:text-white">
                Ya tengo cuenta →
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-white/10 pt-8 text-sm text-white/60">
              <a href="mailto:hola@aidmin.cl" className="inline-flex items-center gap-2 hover:text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="m4 6.5 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                hola@aidmin.cl
              </a>
              <a href="https://wa.me/56942668165" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.5 9.3c.3-1 1-1 1.4-1 .3 0 .6 0 .8.5.3.6.9 1.9.9 2.1 0 .2 0 .4-.2.6-.2.3-.4.5-.6.7-.2.2-.4.4-.2.8.2.4.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.7 1.6.4.2.6.1.9-.1.2-.3.9-1 1.1-1.4.2-.4.5-.3.8-.2.3.1 2 .9 2.3 1.1.3.2.5.2.6.4.1.2.1 1-.3 2-.4.9-2 1.7-2.8 1.8-.8.1-1.5.1-4.5-1-3.6-1.5-5.9-5.3-6.1-5.5-.2-.3-1.4-1.9-1.4-3.6 0-1.7.9-2.6 1.2-2.9Z"
                    fill="currentColor"
                  />
                </svg>
                +56 9 4266 8165
              </a>
              <ShareButton />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
