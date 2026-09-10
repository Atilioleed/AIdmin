import Link from 'next/link';
import { AgentNetworkVisual } from '../AgentNetworkVisual';

export function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      <div
        className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full opacity-30 blur-3xl animate-drift"
        style={{ background: 'var(--gradient-brand)' }}
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-[var(--color-gold-soft)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)] animate-pulse-glow" />
            Ya trabajando para FIRMA IA
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1] text-white sm:text-5xl">
            Un equipo directivo <span className="text-gradient-warm">que nunca duerme</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-white/70">
            AIdmin pone seis gerentes de inteligencia artificial a cargo de tu pyme —
            marketing, finanzas, producto, legal, desarrollo y un CEO que preside el
            comité — trabajando en conjunto, todos los días, contigo siempre a cargo
            de la última palabra.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/sign-up"
              className="rounded-full px-6 py-3 text-sm font-semibold text-[var(--color-violet-night)] shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(120deg, var(--color-gold), var(--color-orange))' }}
            >
              Empieza ahora
            </Link>
            <a href="#como-funciona" className="text-sm font-semibold text-white/75 hover:text-white">
              Ver cómo funciona →
            </a>
          </div>
          <p className="mt-8 text-xs font-medium text-white/40">
            Planes desde $169.900/mes · aprobación humana en cada gasto y publicación
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <AgentNetworkVisual compact />
        </div>
      </div>
    </section>
  );
}
