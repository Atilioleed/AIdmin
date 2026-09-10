// Precios neto/mes en CLP, mismos tramos del modelo de precios publicado
// (piso $169.900). "Ingresos" en el panel admin se calcula de esto x pymes activas -
// no hay pasarela de pago real conectada todavia (decision explicita del plan).
export const PLAN_PRICES_CLP: Record<'piloto' | 'completo' | 'agencia', number> = {
  piloto: 169900,
  completo: 249900,
  agencia: 199900,
};

export const PLAN_LABELS: Record<'piloto' | 'completo' | 'agencia', string> = {
  piloto: 'Piloto (3 agentes)',
  completo: 'Completo (6 agentes)',
  agencia: 'Agencia (multi-pyme)',
};

export function formatClp(amount: number): string {
  return amount.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
}
