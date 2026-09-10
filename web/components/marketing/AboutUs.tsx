import { Reveal } from './Reveal';

export function AboutUs() {
  return (
    <section id="nosotros" className="mx-auto max-w-4xl px-6 py-24">
      <Reveal>
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-coral)]">Sobre nosotros</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-[var(--color-ink)] sm:text-4xl">
          Hecho en Chile, <span className="text-gradient-warm">para pymes chilenas</span>
        </h2>
        <div className="mt-5 flex flex-col gap-4 text-base leading-relaxed text-[var(--color-ink-soft)]">
          <p>
            AIdmin nace de una pregunta simple: ¿por qué solo las empresas grandes
            pueden darse el lujo de tener un equipo de marketing, finanzas y legal
            propio? Las pymes hacen el 98% de las empresas en Chile y son las que
            menos tiempo y presupuesto tienen para ese trabajo — así que lo
            construimos para ellas primero.
          </p>
          <p>
            Somos un equipo chico, construyendo con el mismo criterio que le
            pedimos a nuestros gerentes de IA: nada se mueve solo. Cada decisión que
            importa — un gasto, una publicación, un contrato — pasa siempre por una
            persona. Preferimos crecer despacio y bien antes que prometer algo que
            no podemos sostener.
          </p>
          <p>
            Si tienes dudas, sugerencias o quieres contarnos qué te falta a tu
            pyme, escríbenos directo a{' '}
            <a href="mailto:hola@aidmin.cl" className="font-semibold text-[var(--color-violet)] hover:text-[var(--color-coral)]">
              hola@aidmin.cl
            </a>{' '}
            — leemos todo.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
