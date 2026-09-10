import type { Metadata } from 'next';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Cómo AIdmin recopila, usa y protege los datos de tu pyme y de tu negocio, conforme a la Ley 19.628 sobre protección de datos personales de Chile.',
  alternates: { canonical: '/privacidad' },
};

export default function PrivacidadPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)] sm:text-4xl">
            Política de privacidad
          </h1>
          <p className="mt-2 text-sm text-[var(--color-ink-faint)]">Última actualización: {new Date().toLocaleDateString('es-CL')}</p>

          <div className="mt-8 flex flex-col gap-8 text-sm leading-relaxed text-[var(--color-ink-soft)]">
            <section>
              <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">1. Qué datos recopilamos</h2>
              <p className="mt-2">
                Datos de la cuenta (nombre, correo, empresa), el contexto de negocio que completas en tu panel
                (objetivo, productos, mercado), los archivos que subes para tus gerentes IA, y datos de uso de la
                plataforma. Si conectas tus redes sociales, guardamos los enlaces que indicas.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">2. Para qué los usamos</h2>
              <p className="mt-2">
                Exclusivamente para que tus gerentes IA trabajen con contexto real de tu negocio, para operar y
                mejorar el servicio, y para comunicarnos contigo (soporte, alertas del comité que tú configuras). No
                vendemos tus datos a terceros.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">3. Con quién los compartimos</h2>
              <p className="mt-2">
                Con proveedores que hacen posible el servicio (hosting, base de datos, envío de correos, el
                proveedor del modelo de IA que procesa las solicitudes) bajo acuerdos de confidencialidad, y nunca
                para fines distintos a operar AIdmin.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">4. Dónde se almacenan</h2>
              <p className="mt-2">
                Tus datos se almacenan en infraestructura en la nube con controles de acceso por cuenta y por
                empresa (Organization) — los datos de una pyme nunca son visibles para otra.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">5. Tus derechos</h2>
              <p className="mt-2">
                Conforme a la Ley N° 19.628 sobre Protección de la Vida Privada, puedes solicitar acceso,
                rectificación o eliminación de tus datos personales escribiendo a hola@aidmin.cl. Responderemos
                dentro de un plazo razonable.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">6. Cookies</h2>
              <p className="mt-2">
                Usamos cookies necesarias para mantener tu sesión iniciada y, si están configuradas, herramientas de
                analítica para entender el uso del sitio de forma agregada.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">7. Contacto</h2>
              <p className="mt-2">
                Para cualquier consulta sobre esta política, escríbenos a{' '}
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
