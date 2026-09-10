import Script from 'next/script';

/**
 * Se auto-omite si no hay NEXT_PUBLIC_GA_MEASUREMENT_ID configurado (crear la
 * propiedad GA4 es una cuenta de Google del usuario, no algo que se pueda generar
 * desde aca - ver .env.local.example).
 */
export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
