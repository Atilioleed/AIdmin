-- AIdmin - seed inicial
-- Los agentes quedan registrados desde ya para que el esquema los soporte sin
-- retrabajo. Se activan de a uno por sprint. 'producto' se redefinio: ya no es solo
-- catalogo/precios, ahora tambien investiga mercado/competencia (con acceso web real
-- via Tavily) para proponer mejoras; marketing queda 100% en publicidad/redes.

INSERT INTO agents (slug, name, role_description, autonomy_level, is_active)
VALUES
  (
    'desarrollo',
    'Gerente de Desarrollo',
    'Monitoreo de infraestructura, errores y costos de hosting.',
    'act_low_risk',
    TRUE
  ),
  (
    'ceo',
    'Gerente General (CEO)',
    'Lee los reportes recientes de los otros agentes y las aprobaciones pendientes; arma la pauta de comite diaria (acuerdos, tensiones, prioridades).',
    'recommend_only',
    TRUE
  ),
  (
    'marketing',
    'Gerente de Marketing',
    'Gestiona redes, contenido, leads y campanas.',
    'act_with_gate',
    FALSE
  ),
  (
    'finanzas',
    'Gerente de Finanzas',
    'Flujo de caja, conciliacion y cuentas por pagar.',
    'propose_only',
    TRUE
  ),
  (
    'producto',
    'Gerente de Producto',
    'Catalogo, costos y precios; investiga mercado y competencia (acceso web real) para proponer mejoras.',
    'propose_only',
    TRUE
  ),
  (
    'legal',
    'Gerente Legal',
    'Revisa el catalogo de documentos legales por cumplimiento; coordina con Producto en propuestas nuevas.',
    'propose_only',
    TRUE
  )
ON CONFLICT (slug) DO NOTHING;
