// Next.js 16 renombro middleware.ts -> proxy.ts (misma funcion, otro nombre de
// archivo/export). Clerk sigue funcionando igual, solo cambia donde vive.
//
// Este proxy SOLO chequea "hay sesion" / "hay Organization activa" - son los unicos
// datos disponibles aqui sin una llamada extra a la API de Clerk. La autorizacion
// fina de admin (por correo, ver lib/tenant.ts) vive en app/(admin)/layout.tsx,
// siguiendo la recomendacion de Clerk de no confiar solo en el proxy para esto.
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isClientRoute = createRouteMatcher(['/dashboard(.*)']);

export const proxy = clerkMiddleware(async (auth, req) => {
  const { userId, orgId, redirectToSignIn } = await auth();

  if (isAdminRoute(req)) {
    if (!userId) return redirectToSignIn();
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
