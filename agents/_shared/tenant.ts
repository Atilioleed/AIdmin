// Resuelve el tenant para el que corre una llamada a un agente. El CLI/n8n de un solo
// tenant no pasa nada y cae al DEFAULT_TENANT_ID del .env; el panel web (multi-tenant)
// siempre pasa un tenantId explicito por request, resuelto de la sesion de Clerk.
export function resolveTenantId(explicitTenantId?: string): string {
  const tenantId = explicitTenantId ?? process.env.DEFAULT_TENANT_ID;
  if (!tenantId) {
    throw new Error(
      'No hay tenantId: pasalo explicito o define DEFAULT_TENANT_ID en .env ' +
        "(SELECT id FROM tenants WHERE name = 'FIRMA IA SpA';).",
    );
  }
  return tenantId;
}
