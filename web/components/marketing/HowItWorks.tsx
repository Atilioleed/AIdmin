import { Reveal } from './Reveal';

const STEPS = [
  {
    n: '01',
    title: 'Tus gerentes trabajan',
    body: 'Cada agente investiga, redacta y prepara su parte — contenido, gastos, contratos, features — todos los días, sin que tengas que pedirlo.',
  },
  {
    n: '02',
    title: 'Lo sensible espera tu firma',
    body: 'Todo lo que implica dinero real o una publicación pública se detiene en un canal humano. Nada sale sin que tú lo apruebes.',
  },
  {
    n: '03',
    title: 'Decides con un clic',
    body: 'Apruebas o rechazas desde tu panel. Cada decisión — tuya y de tus gerentes — queda registrada en una bitácora trazable.',
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative overflow-hidden py-24" style={{ background: 'var(--gradient-hero)' }}>
      <div
        className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full opacity-20 blur-3xl animate-drift"
        style={{ background: 'var(--gradient-cool)' }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)]">Cómo funciona</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">
              Autonomía real, <span className="text-gradient-warm">contigo al mando</span>
            </h2>
            <p className="mt-3 text-white/65">
              AIdmin no te reemplaza — te devuelve tiempo. Los gerentes hacen el trabajo
              pesado; tú sigues tomando cada decisión que importa.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 100}>
              <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <span className="font-display text-4xl font-semibold text-white/15">{step.n}</span>
                <h3 className="mt-3 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
