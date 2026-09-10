// Next.js 16 renombro middleware.ts -> proxy.ts (misma funcion, otro nombre de
// archivo/export). Clerk sigue funcionando igual, solo cambia donde vive.
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isClientRoute = createRouteMatcher(['/dashboard(.*)']);

function isPlatformAdmin(userId: string | null): boolean {
  if (!userId) return false;
  const adminIds = (process.env.ADMIN_CLERK_USER_IDS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  return adminIds.includes(userId);
}

export const proxy = clerkMiddleware(async (auth, req) => {
  const { userId, orgId, redirectToSignIn } = await auth();

  if (isAdminRoute(req)) {
    if (!userId) return redirectToSignIn();
    if (!isPlatformAdmin(userId)) {
      return NextResponse.redirect(new URL('/no-autorizado', req.url));
    }
    return NextResponse.next();
  }

  if (isClientRoute(req)) {
    if (!userId) return redirectToSignIn();
    if (!orgId) {
      return NextResponse.redirect(new URL('/sin-pyme', req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/(api|trpc)(.*)'],
};
