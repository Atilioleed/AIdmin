'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganizationList } from '@clerk/nextjs';

/**
 * Arregla un callejon sin salida real: si a un usuario se le agrega una
 * Organization DESPUES de su primer login (via la API de Clerk, como al asociar
 * un cliente a mano), su sesion no la activa sola y proxy.ts lo manda para
 * siempre a /sin-pyme - sin forma de llegar al OrganizationSwitcher, que vive
 * adentro del panel al que justamente no puede entrar. Esto le da una salida:
 * si tiene una sola Organization la activa sola; si tiene varias, elige.
 */
export function OrganizationGate() {
  const router = useRouter();
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: true,
  });
  const [pendingId, setPendingId] = useState<string | null>(null);
  const autoActivated = useRef(false);

  const memberships = useMemo(() => userMemberships.data ?? [], [userMemberships.data]);

  useEffect(() => {
    if (!isLoaded || !setActive || autoActivated.current) return;
    if (memberships.length !== 1) return;
    autoActivated.current = true;
    const orgId = memberships[0].organization.id;
    const frame = requestAnimationFrame(() => {
      setPendingId(orgId);
      void setActive({ organization: orgId }).then(() => router.push('/dashboard'));
    });
    return () => cancelAnimationFrame(frame);
  }, [isLoaded, memberships, setActive, router]);

  async function activate(organizationId: string) {
    if (!setActive) return;
    setPendingId(organizationId);
    await setActive({ organization: organizationId });
    router.push('/dashboard');
  }

  if (!isLoaded) {
    return <p className="text-sm text-neutral-500">Buscando tus empresas…</p>;
  }

  if (memberships.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-medium text-neutral-500">
        {memberships.length === 1 ? 'Entrando a tu empresa…' : 'Elige a qué empresa quieres entrar'}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {memberships.map((m) => (
          <button
            key={m.organization.id}
            type="button"
            onClick={() => activate(m.organization.id)}
            disabled={pendingId !== null}
            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-60"
          >
            {pendingId === m.organization.id ? 'Entrando…' : `Entrar a ${m.organization.name}`}
          </button>
        ))}
      </div>
    </div>
  );
}
