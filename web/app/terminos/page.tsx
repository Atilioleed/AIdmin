import type { Metadata } from 'next';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description: 'Términos y condiciones de uso de AIdmin, la plataforma de gerentes de inteligencia artificial para pymes.',
  alternates: { canonical: '/terminos' },
};

export default function TerminosPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)] sm:text-4xl">
            Términos y condiciones
          </h1>
          <p className="mt-2 text-sm text-[var(--color-ink-faint)]">Última actualización: {new Date().toLocaleDateString('es-CL')}</p>

          <div className="mt-8 flex flex-col gap-8 text-sm leading-relaxed text-[var(--color-ink-soft)]">
            <section>
              <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">1. Qué es AIdmin</h2>
              <p className="mt-2">
                AIdmin es una plataforma de software como servicio (SaaS) que provee a pymes acceso a agentes de
                inteligencia artificial (&quot;gerentes IA&quot;) que investigan, redactan y proponen trabajo relacionado con
                marketing, finanzas, producto, aspectos legales y desarrollo digital. Ninguna acción que implique un
                gasto real o una publicación pública se ejecuta sin aprobación humana explícita del cliente.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">2. Cuenta y planes</h2>
              <p className="mt-2">
                Para usar AIdmin necesitas crear una cuenta y asociarla a tu empresa (Organization). Los planes
                disponibles y sus precios se publican en la sección de Precios del sitio y pueden actualizarse con
                aviso previo. El cliente es responsable de la veracidad de la información que entrega sobre su
                negocio.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">3. Aprobación humana</h2>
              <p className="mt-2">
                Es una condición central del servicio: todo gasto real y toda publicación pública que un gerente IA
                proponga queda pendiente de aprobación por parte de una persona autorizada de tu empresa antes de
                ejecutarse. AIdmin no se hace responsable de acciones aprobadas por el cliente que luego resulten
                perjudiciales para su negocio.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">4. Uso aceptable</h2>
              <p className="mt-2">
                No está permitido usar AIdmin para actividades ilegales, para generar contenido fraudulento o
                engañoso, ni para intentar vulnerar la seguridad de la plataforma o de otros usuarios.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">5. Propiedad intelectual</h2>
              <p className="mt-2">
                El contenido, código y diseño de AIdmin son propiedad de AIdmin. El contenido que tus gerentes IA
                generan para tu negocio (propuestas, borradores, documentos) es tuyo una vez aprobado y publicado.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">6. Límite de responsabilidad</h2>
              <p className="mt-2">
                AIdmin se entrega &quot;tal cual&quot;. Trabajamos para que la información que generan los gerentes IA sea
                precisa y útil, pero no garantizamos resultados de negocio específicos. El cliente mantiene el
                control y la responsabilidad final sobre cada decisión que aprueba.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">7. Cancelación</h2>
              <p className="mt-2">
                Puedes cancelar tu suscripción en cualquier momento desde tu panel o escribiendo a hola@aidmin.cl.
                No hay permanencia mínima.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">8. Contacto</h2>
              <p className="mt-2">
                Para consultas sobre estos términos, escríbenos a{' '}
                <a href="mailto:hola@aidmin.cl" className="font-semibold text-[var(--color-violet)] hover:text-[var(--color-coral)]">
                  hola@aidmin.cl
                </a>{' '}
                o al +56 9 4266 8165.
              </p>
            </section>
          </div>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
