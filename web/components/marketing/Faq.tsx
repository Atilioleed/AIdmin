import { Reveal } from './Reveal';

export const FAQ_ITEMS = [
  {
    question: '¿Qué es AIdmin exactamente?',
    answer:
      'AIdmin es una plataforma que le asigna a tu pyme seis gerentes de inteligencia artificial — marketing, finanzas, producto, legal, desarrollo y un CEO que preside el comité — que investigan, preparan y proponen trabajo todos los días. Tú apruebas antes de que cualquier gasto real o publicación pública salga.',
  },
  {
    question: '¿Los gerentes de IA pueden gastar dinero o publicar sin avisarme?',
    answer:
      'No. Cualquier acción que implique dinero real o una publicación pública queda pendiente en un canal de aprobación humana. AIdmin nunca ejecuta una transferencia ni publica un post por su cuenta.',
  },
  {
    question: '¿Necesito instalar algo o contratar a alguien de TI?',
    answer:
      'No. AIdmin funciona desde el navegador — creas tu cuenta, completas el contexto de tu negocio y tu comité empieza a trabajar. No requiere instalación ni conocimientos técnicos.',
  },
  {
    question: '¿Cuánto cuesta y qué incluye?',
    answer:
      'Los planes parten en $169.900/mes. El plan Piloto incluye 3 gerentes a elección; el plan Completo activa los 6 gerentes con comité diario; el plan Agencia permite administrar varias pymes desde un solo panel. Todos incluyen canal de aprobaciones y bitácora de decisiones.',
  },
  {
    question: '¿AIdmin reemplaza a mi equipo o a mí como dueño?',
    answer:
      'No. AIdmin hace el trabajo repetitivo — investigar, redactar, preparar propuestas — pero cada decisión que importa (gastos, publicaciones, contratos) sigue pasando por tu aprobación.',
  },
  {
    question: '¿Qué pasa si no tengo página web o redes sociales todavía?',
    answer:
      'AIdmin incluye un creador de sitio web con plantillas listas para personalizar (colores, textos, productos) y conecta tus redes sociales para que Marketing trabaje con datos reales desde el primer día.',
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-4xl px-6 py-24">
      <Reveal>
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-coral)]">Preguntas frecuentes</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-[var(--color-ink)] sm:text-4xl">
            Antes de <span className="text-gradient-warm">empezar</span>
          </h2>
        </div>
      </Reveal>

      <div className="mt-10 flex flex-col gap-3">
        {FAQ_ITEMS.map((item, i) => (
          <Reveal key={item.question} delay={i * 50}>
            <details className="group card overflow-hidden p-0 open:shadow-[var(--shadow-card-hover)]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-[var(--color-ink)]">
                {item.question}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="shrink-0 text-[var(--color-violet)] transition-transform group-open:rotate-45"
                  aria-hidden="true"
                >
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </summary>
              <p className="border-t border-[var(--color-border-soft)] px-5 py-4 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                {item.answer}
              </p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
