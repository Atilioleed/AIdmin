import Link from 'next/link';
import { PLAN_PRICES_CLP, PLAN_LABELS, formatClp } from '../../lib/plans';
import { Reveal } from './Reveal';

const PLAN_FEATURES: Record<keyof typeof PLAN_PRICES_CLP, string[]> = {
  piloto: ['3 gerentes a elección', 'Canal de aprobaciones', 'Bitácora de decisiones', 'Soporte por correo'],
  completo: ['Los 6 gerentes activos', 'Comité diario con pauta', 'Redes sociales + Metricool', 'Subida de archivos y fotos'],
  agencia: ['Multi-pyme, un solo panel', 'Gerentes por cada marca', 'Prioridad de soporte', 'Onboarding asistido'],
};

const ORDER: (keyof typeof PLAN_PRICES_CLP)[] = ['piloto', 'completo', 'agencia'];

export function Pricing() {
  return (
    <section id="precios" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-coral)]">Precios</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-[var(--color-ink)] sm:text-4xl">
            Un piso <span className="text-gradient-warm">premium</span>, sin letra chica
          </h2>
          <p className="mt-3 text-[var(--color-ink-soft)]">
            No existe hoy nada comparable en el mercado chileno. Elige cuántos
            gerentes necesitas y empieza esta semana.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {ORDER.map((plan, i) => {
          const featured = plan === 'completo';
          return (
            <Reveal key={plan} delay={i * 90}>
              <div
                className={`relative flex h-full flex-col rounded-2xl border p-7 ${
                  featured
                    ? 'border-transparent text-white shadow-[var(--shadow-glow)]'
                    : 'card border-[var(--color-border)]'
                }`}
                style={featured ? { background: 'var(--gradient-hero)' } : undefined}
              >
                {featured && (
                  <span
                    className="absolute -top-3 left-7 rounded-full px-3 py-1 text-[11px] font-bold text-[var(--color-violet-night)]"
                    style={{ background: 'var(--color-gold)' }}
                  >
                    Más elegido
                  </span>
                )}
                <h3 className={`font-display text-lg font-semibold ${featured ? 'text-white' : 'text-[var(--color-ink)]'}`}>
                  {PLAN_LABELS[plan]}
                </h3>
                <p className={`mt-3 font-display text-3xl font-semibold ${featured ? 'text-white' : 'text-[var(--color-ink)]'}`}>
                  {formatClp(PLAN_PRICES_CLP[plan])}
                  <span className={`ml-1 text-sm font-sans font-normal ${featured ? 'text-white/60' : 'text-[var(--color-ink-faint)]'}`}>
                    /mes
                  </span>
                </p>
                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  {PLAN_FEATURES[plan].map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${featured ? 'text-white/75' : 'text-[var(--color-ink-soft)]'}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                        <path
                          d="M5 12.5 9.5 17 19 7.5"
                          stroke={featured ? '#F7BC45' : 'var(--color-violet)'}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className={`mt-7 rounded-full px-5 py-2.5 text-center text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
                    featured ? 'text-[var(--color-violet-night)]' : 'text-white'
                  }`}
                  style={{ background: featured ? 'linear-gradient(120deg, var(--color-gold), var(--color-orange))' : 'var(--gradient-brand)' }}
                >
                  Empezar con {PLAN_LABELS[plan].split(' ')[0]}
                </Link>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
