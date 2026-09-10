import Link from 'next/link';
import { Reveal } from './Reveal';

const TAKEAWAYS = [
  '6 gerentes de IA (marketing, finanzas, producto, legal, desarrollo y un CEO) trabajando en tu pyme todos los días.',
  'Investigan mercado y competencia, preparan contenido, cuidan el flujo de caja y redactan documentos — tú apruebas antes de que algo se publique o se pague.',
  'Nada sale solo: cada gasto real y cada publicación pública espera tu aprobación en un panel simple.',
  'Sin instalar nada ni contratar un equipo de TI — el panel corre en el navegador, desde $169.900/mes.',
];

const COMPARISON = [
  { task: 'Investigar competencia y precios del mercado', without: 'Lo haces tú, cuando alcanzas', with: 'Producto lo revisa todos los días' },
  { task: 'Redes sociales y contenido', without: 'Contratas una agencia o lo dejas botado', with: 'Marketing prepara posts, tú apruebas' },
  { task: 'Flujo de caja y cuentas por pagar', without: 'Planilla suelta, sorpresas a fin de mes', with: 'Finanzas lo vigila y te avisa a tiempo' },
  { task: 'Contratos y documentos legales', without: 'Copias plantillas de internet', with: 'Legal redacta y revisa dentro de tus límites' },
  { task: 'Sitio web y bugs', without: 'Le pagas a un freelance cada vez', with: 'Desarrollo lo mantiene y reporta a diario' },
  { task: 'Reporte del estado del negocio', without: 'Lo armas tú, si te queda tiempo', with: 'El CEO te manda la pauta del día' },
];

const AUDIENCE = [
  'Pymes que venden producto o servicio y no tienen equipo de marketing, finanzas o legal propio.',
  'Emprendedores que quieren delegar el trabajo repetitivo sin perder el control de cada decisión.',
  'Negocios que necesitan verse profesionales — sitio, redes y documentos — sin armar un área completa para eso.',
];

export function WhatIsAidmin() {
  return (
    <section id="que-es" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-coral)]">¿Qué es AIdmin?</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-[var(--color-ink)] sm:text-4xl">
            Un comité de gerentes de IA <span className="text-gradient-warm">que corre tu pyme contigo</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--color-ink-soft)]">
            AIdmin es una plataforma que le da a tu pyme seis gerentes de inteligencia
            artificial — marketing, finanzas, producto, legal, desarrollo y un CEO que
            preside el comité — que trabajan todos los días investigando mercado,
            preparando contenido, cuidando tus números y redactando documentos, mientras
            tú sigues teniendo la última palabra en cada gasto y cada publicación.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Link
              href="/sign-up"
              className="rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5"
              style={{ background: 'var(--gradient-brand)' }}
            >
              Empieza ahora
            </Link>
            <a href="#precios" className="text-sm font-semibold text-[var(--color-violet)] hover:text-[var(--color-coral)]">
              Ver planes y precios →
            </a>
          </div>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-violet)]">Resumen rápido</p>
          <ul className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {TAKEAWAYS.map((t) => (
              <li key={t} className="flex gap-2.5 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0">
                  <path d="M5 12.5 9.5 17 19 7.5" stroke="var(--color-violet)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal delay={140}>
        <div className="mt-16">
          <h3 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
            ¿Por qué contratar AIdmin en vez de hacerlo tú mismo?
          </h3>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-ink-soft)]">
            No es reemplazar a un equipo humano — es tener uno trabajando todos los
            días en las tareas que hoy quedan pendientes por falta de tiempo.
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--color-border)]">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)]">
                  <th className="px-4 py-3 font-semibold text-[var(--color-ink)]">Tarea</th>
                  <th className="px-4 py-3 font-semibold text-[var(--color-ink-faint)]">Sin AIdmin</th>
                  <th className="px-4 py-3 font-semibold text-[var(--color-violet)]">Con AIdmin</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.task} className={i % 2 === 1 ? 'bg-[var(--color-surface-sunken)]/60' : ''}>
                    <td className="px-4 py-3 font-medium text-[var(--color-ink)]">{row.task}</td>
                    <td className="px-4 py-3 text-[var(--color-ink-faint)]">{row.without}</td>
                    <td className="px-4 py-3 text-[var(--color-ink-soft)]">{row.with}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      <Reveal delay={200}>
        <div className="mt-16 max-w-2xl">
          <h3 className="font-display text-2xl font-semibold text-[var(--color-ink)]">¿A quién le sirve AIdmin?</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {AUDIENCE.map((a) => (
              <li key={a} className="flex gap-2.5 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: 'var(--gradient-brand)' }} />
                {a}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
