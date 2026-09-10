import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

function isPlatformAdmin(userId: string | null): boolean {
  if (!userId) return false;
  const adminIds = (process.env.ADMIN_CLERK_USER_IDS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  return adminIds.includes(userId);
}

export default async function Home() {
  const { userId, orgId } = await auth();

  if (!userId) redirect('/sign-in');
  if (isPlatformAdmin(userId)) redirect('/admin');
  if (orgId) redirect('/dashboard');
  redirect('/sin-pyme');
}
