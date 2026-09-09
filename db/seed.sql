-- AIdmin - seed inicial
-- Los 5 agentes de la arquitectura objetivo quedan registrados desde ya para que el
-- esquema los soporte sin retrabajo, pero solo 'desarrollo' esta activo en este sprint
-- (Fase 1). Los demas se activan en sprints posteriores, uno a la vez.

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
    'Lee los reportes semanales de los otros agentes y las metricas de negocio; fija prioridades y sugiere reinversion.',
    'recommend_only',
    FALSE
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
    FALSE
  ),
  (
    'producto',
    'Gerente de Producto',
    'Catalogo, costos y precios.',
    'propose_only',
    FALSE
  )
ON CONFLICT (slug) DO NOTHING;
