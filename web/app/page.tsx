import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isCurrentUserPlatformAdmin } from '../lib/tenant';

export default async function Home() {
  const { userId, orgId } = await auth();

  if (!userId) redirect('/sign-in');
  if (await isCurrentUserPlatformAdmin()) redirect('/admin');
  if (orgId) redirect('/dashboard');
  redirect('/sin-pyme');
}
