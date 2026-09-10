import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isCurrentUserPlatformAdmin } from '../lib/tenant';
import { MarketingPage } from '../components/marketing/MarketingPage';

export default async function Home() {
  const { userId, orgId } = await auth();

  if (!userId) return <MarketingPage />;
  if (await isCurrentUserPlatformAdmin()) redirect('/admin');
  if (orgId) redirect('/dashboard');
  redirect('/sin-pyme');
}
