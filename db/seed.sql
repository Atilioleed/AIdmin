-- AIdmin - seed inicial
-- FIRMA IA es el tenant piloto. Cada pyme nueva que se sume via el panel admin
-- repite este mismo patron: una fila en tenants + sus 6 filas en agents.

INSERT INTO tenants (name, rut, plan, status)
VALUES ('FIRMA IA SpA', NULL, 'completo', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO agents (tenant_id, slug, name, role_description, autonomy_level, is_active)
SELECT t.id, a.slug, a.name, a.role_description, a.autonomy_level, a.is_active
FROM tenants t
CROSS JOIN (
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
      'Gestiona redes, contenido y campanas via Metricool (100% publicidad/redes, sin research de mercado). Contenido organico pasa por content-gate, gasto por approval-gate.',
      'act_with_gate',
      TRUE
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
) AS a (slug, name, role_description, autonomy_level, is_active)
WHERE t.name = 'FIRMA IA SpA'
ON CONFLICT (tenant_id, slug) DO NOTHING;
