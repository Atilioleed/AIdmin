import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isCurrentUserPlatformAdmin } from '../lib/tenant';
import { MarketingPage } from '../components/marketing/MarketingPage';

export const metadata: Metadata = {
  title: { absolute: 'AIdmin — Gerentes de inteligencia artificial para pymes' },
  description:
    'AIdmin le da a tu pyme 6 gerentes de IA (marketing, finanzas, producto, legal, desarrollo y un CEO) que investigan, preparan y proponen trabajo todos los días — tú apruebas cada gasto y publicación. Desde $169.900/mes.',
  alternates: { canonical: 'https://aidmin.cl' },
  openGraph: {
    title: 'AIdmin — Gerentes de inteligencia artificial para pymes',
    description: 'Un comité de 6 gerentes de IA trabajando todos los días en tu pyme, con aprobación humana en cada gasto y publicación.',
    url: 'https://aidmin.cl',
    siteName: 'AIdmin',
    locale: 'es_CL',
    type: 'website',
  },
};

export default async function Home() {
  const { userId, orgId } = await auth();

  if (!userId) return <MarketingPage />;
  if (await isCurrentUserPlatformAdmin()) redirect('/admin');
  if (orgId) redirect('/dashboard');
  redirect('/sin-pyme');
}
