import Link from 'next/link';
import { Reveal } from './Reveal';

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
          </div>
        </div>
      </Reveal>
    </section>
  );
}
