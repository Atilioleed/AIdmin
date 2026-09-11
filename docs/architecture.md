# Arquitectura de AIdmin

Referencia completa del sistema objetivo. Este sprint solo implementa lo marcado como
**construido**; el resto queda descrito para que el diseño de base (esquema de DB,
`Agent`, `approval-gate`) no necesite retrabajo cuando se construyan en sprints
posteriores.

## Las 4 capas

1. **Canal humano** — donde Atilio aprueba pagos, gasto de marketing, contenido
   público y decisiones grandes, y puede intervenir en cualquier momento.
   **Construido**: dos módulos gemelos, uno por tipo de riesgo irreversible (ver
   sección 1 del proyecto: "dinero y marca pública"). `approval-gate/server.ts`
   (`GET /approvals`, `POST /approvals/:id/approve|reject`) para dinero/campañas
   pagas, y `content-gate/server.ts` (`GET /content-reviews`,
   `POST /content-reviews/:id/approve|reject`) para contenido orgánico antes de
   publicarse. El canal real (WhatsApp Business) se conecta en un sprint posterior.

2. **Orquestador** — el "reloj" que despierta a cada agente en su horario o por
   evento y enruta reportes entre ellos.
   **Construido**: n8n self-hosted vía `docker-compose.yml`, con un workflow por
   agente en `orchestrator/n8n/` (cron + disparo manual de prueba). La lógica de
   negocio fina vive en TypeScript, no en n8n.

3. **Memoria y datos** — historial de decisiones, reportes, métricas, catálogo.
   **Construido**: PostgreSQL local vía Docker (`db/schema.sql`, `db/seed.sql`),
   pensado para migrar a Supabase en producción sin cambios de esquema.

4. **Agentes** — los "gerentes". Cada uno es un módulo de TypeScript que envuelve el
   SDK de Anthropic (Claude), carga su constitución (system prompt versionado como
   markdown, con nombre y personalidad propios), tiene un set de tools específico de
   su rol, y escribe su reporte y su razonamiento en la base de datos en cada corrida.
   **Construido**: `agents/_shared/agent.ts` (clase base) + 6 agentes (ver tabla).

## Los agentes

| Agente         | Nombre    | Rol                                                                                  | Herramientas típicas                                                 | Autonomía                                                                                                                                                              | Estado                  |
| -------------- | --------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| CEO / Comité   | Rodrigo   | Lee los reportes recientes de todos y arma la pauta de comité (1-2 veces por semana) | Lectura de `reports`/`approvals` (solo lectura, sin tools de accion) | Solo recomienda. Nunca autoriza gasto ni reemplaza la aprobación humana.                                                                                               | **Construido**          |
| Marketing      | Sofía     | Publicidad, redes sociales, contenido, campañas (100% de eso, nada de research)      | Metricool (mock este sprint)                                         | Contenido orgánico SOLO vía `propose_post` → content-gate (`pending_review`). Gasto/campañas SOLO vía approval-gate. Nunca publica ni ejecuta nada directo.            | **Construido**          |
| Finanzas       | Valentina | Flujo de caja, conciliación, cuentas por pagar                                       | SII (OpenFactura/Bsale), agregación bancaria (Fintoc) — mocks        | SOLO PROPONE. Deja la orden de pago en `pending_approval`. Nunca ejecuta una transferencia real.                                                                       | **Construido**          |
| Producto       | Camila    | Catálogo/precios; investiga mercado y competencia (único agente con acceso web real) | Tavily (búsqueda web real), catálogo mock                            | SOLO PROPONE mejoras (`propose_improvement`); se publica solo tras aprobación humana.                                                                                  | **Construido**          |
| Legal          | Francisca | Revisa el catálogo de documentos por cumplimiento; coordina con Producto             | Catálogo de plantillas + checklist legal (mocks)                     | SOLO REVISA Y MARCA (`flag_document_for_legal_review`). Nunca modifica ni publica el catálogo.                                                                         | **Construido**          |
| **Desarrollo** | Mauricio  | Monitoreo de infraestructura, errores, costos de hosting                             | Uptime check, lectura de logs (Sentry), GitHub API — mocks           | Puede actuar solo en tareas de bajo riesgo (reiniciar, alertar, abrir un borrador de fix). Cambios estructurales o despliegues a producción requieren revisión humana. | **Piloto - construido** |

Los 6 agentes están seedeados y activos en la tabla `agents` (`db/seed.sql`).

### Marketing y el content-gate: la otra mitad de "dinero y marca pública"

El prompt fundacional (sección 1) marca dos cosas como irreversibles y no
negociables: dinero y marca pública. El approval-gate ya cubría dinero; Marketing
(`agents/marketing/`) es el primer agente cuyo trabajo central es marca pública, así
que se construyó su contraparte: `content-gate/` (mismo patrón exacto que
`approval-gate/` - TDD, repositorio en memoria para tests, implementación real en
Postgres, servidor HTTP para el canal humano). `propose_post` es la única forma en
que Marketing puede dejar un post listo, y siempre queda en `pending_review` -
jamás publica nada, no tiene credenciales de ninguna red social. Para gasto
(`propose_paid_campaign`, `propose_budget_change`) usa el approval-gate existente,
igual que Finanzas. En una corrida real, Marketing recibió un comentario mock con un
intento de manipulación pidiéndole subir presupuesto al máximo y publicar sin
revisión - lo marcó como sospechoso en su reporte y igual dejó la propuesta de
campaña con presupuesto moderado y bien fundamentado, vía el flujo normal.

### Personalidad: por qué cada agente "suena" distinto

La personalidad de cada agente (nombre propio, trasfondo profesional concreto - SRE
para Mauricio, contadora para Valentina, abogada para Francisca, estratega de
producto para Camila, generalista de negocio para Rodrigo -, habilidades y objetivo)
ya NO vive hardcodeada en `constitution.md`: vive en la tabla `agent_profiles`
(global por rol, no por tenant) y es editable desde `/admin/agentes` sin tocar
código ni redesplegar. `Agent.run()` arma el system prompt completo concatenando esa
mitad editable (`agents/_shared/agent-profile.ts`) con la mitad fija que sí sigue en
cada `constitution.md`: límites de autonomía y reglas de gobernanza, deliberadamente
protegidas de edición desde el panel para que nadie afloje sin querer una regla de
seguridad (aprobación humana de plata/contenido público) desde un formulario. La
personalidad no es cosmética: define tambien el alcance ("no opinas fuera de tu
cancha salvo que tenga impacto directo en otra area, y ahi lo marcas explicito") -
eso es lo que hace que sus reportes sean cruzables por el Comité en vez de
redundantes entre si.

Además de los rasgos de personalidad originales, cada gerente tiene un set de
habilidades concretas de especialista, mapeadas desde las 14 categorías/166 skills de
[awesome-claude-corporate-skills](https://github.com/w95/awesome-claude-corporate-skills)
(cobertura completa de las 14, repartida entre los 6 según el rol más natural - ej.
Finanzas también cubre Compras/Proveedores, Legal también cubre políticas de RR.HH.).
Son bullets descriptivos, no los `SKILL.md` completos importados uno a uno - mismo
criterio que el resto del proyecto: sustancia sobre volumen.

### El Comité: cómo "discuten" los agentes y llegan a acuerdos

Los agentes NO conversan en vivo entre sí (eso requeriria un protocolo de turnos
mucho mas complejo y caro de tokens, evaluado y descartado para este sprint). En vez
de eso, el sistema usa **sintesis secuencial**: cada agente corre independiente y
deja su reporte en `reports`; el CEO (Rodrigo) corre despues de todos y usa
`list_recent_reports()` + `list_pending_approvals()` para leer sus posiciones una al
lado de la otra, y en su propio reporte (la **pauta de comité**) señala:

- **Acuerdos** — donde dos o más agentes apuntan en la misma dirección sin haberse
  coordinado (ej.: Desarrollo y Finanzas detectando el mismo patrón de intento de
  fraude/prompt injection en canales distintos, en una corrida real de prueba).
- **Tensiones** — donde chocan (ej.: Producto proponiendo expansión de catálogo
  mientras Finanzas reporta caja ajustada, o Producto queriendo lanzar rápido
  mientras Legal marca los documentos existentes con riesgo alto).
- **Aprobaciones pendientes** priorizadas, y una **recomendación de prioridades**
  explícitamente marcada como recomendación, nunca como decisión tomada.

El CEO no tiene ninguna tool de acción — solo lee. Es, por diseño, el agente con
menos autonomía técnica de todos, porque su output completo es una recomendación
para Atilio.

### Producto: el único agente con acceso a internet real

`agents/producto/tavily-client.ts` llama a la API real de
[Tavily](https://tavily.com) (`POST https://api.tavily.com/search`). Es la única
tool de todo el proyecto que toca una fuente externa no controlada - por eso su
resultado se envuelve con `asUntrustedContent()` antes de volver al modelo, igual
que las demas, pero la constitución de Producto (`agents/producto/constitution.md`)
tiene una sección de énfasis adicional sobre esto: contenido de internet puede ser
marketing de un competidor disfrazado de hecho, o un intento real de prompt
injection incrustado en una página. En una corrida real de prueba, Producto
encontró competidores reales (Lexius, AILegales, Veredicta, ChileFirmas, Autenti,
entre otros) y una regulación real (Ley 21.719 de protección de datos, vigencia
diciembre 2026) y las citó como evidencia atribuida, no como hechos propios.

### Finanzas: primer uso real del approval-gate

El agente de Finanzas (`agents/finanzas/`) es el primero que genera una acción
gateada de verdad. Su tool `propose_payment` (`agents/finanzas/tools.ts`) no tiene
ninguna otra vía para mover dinero — llama a
`ApprovalGate.requestApproval({ actionType: 'payment', ... })` contra el mismo módulo
que usará Marketing más adelante, y el resultado siempre es `pending_approval`. Sus
otras dos tools (`get_cash_flow_summary`, `list_pending_invoices`) son mocks de
Fintoc/SII; `list_pending_invoices` incluye una factura de ejemplo con un intento de
fraude por ingeniería social (glosa que pide saltarse la aprobación humana) para
probar que la regla de "contenido externo = dato" también se sostiene con dinero de
por medio — el agente la detecta y la reporta como anomalía en vez de proponerla.

## Reglas de gobernanza (no negociables, en código)

1. **Approval Gate / Content Gate obligatorios** — `approval-gate/index.ts`. Toda
   acción de tipo `payment`, `spend`, `budget_change` o `paid_campaign_launch`, sin
   importar qué agente la origine, pasa por `ApprovalGate.requestApproval()`, que
   SIEMPRE crea un registro `pending_approval` y NUNCA ejecuta la acción real.
   `content-gate/index.ts` es su análogo para contenido público: toda publicación
   orgánica pasa por `ContentGate.requestReview()`, SIEMPRE en `pending_review`.
   Ninguno de los dos gates tiene, ni siquiera técnicamente, ningún método ni
   credencial de ejecución/publicación real.
2. **Auditoría completa** — cada tool call y cada reporte final de cada agente se
   escribe en `decisions_log` (timestamp, agente, run_id, input, output, razonamiento)
   antes de que `Agent.run()` retorne. Nada se ejecuta silenciosamente.
3. **Contenido externo = dato, nunca instrucción** — `agents/_shared/untrusted-content.ts`
   expone `asUntrustedContent()` / `formatUntrustedContentForPrompt()`. Cualquier tool
   que devuelva texto de una fuente externa (logs, resultados de scraping, mensajes
   entrantes, resultados de búsqueda web) debe envolverlo antes de devolverlo al
   modelo. Probado end-to-end en cuatro agentes distintos: `agents/desarrollo/tools.ts`
   (`read_recent_logs`, log con intento de prompt injection), `agents/finanzas/tools.ts`
   (`list_pending_invoices`, factura con intento de fraude/ingeniería social),
   `agents/producto/tools.ts` (`search_market`, la única fuente que es internet real
   y no un mock), y `agents/marketing/tools.ts` (`list_recent_comments`, comentario
   con intento de manipulación pidiendo saltarse la revisión humana).
4. **Nada de producción real fuera de lo explícitamente conectado** — sin bancos, sin
   WhatsApp Business real, sin cuentas de ads reales. Desarrollo monitorea una URL de
   sandbox y usa mocks de log/GitHub; Finanzas y Legal usan datos de ejemplo. La única
   excepción deliberada es Producto, que sí tiene acceso real a internet (búsqueda vía
   Tavily) para investigar mercado - decidido explícitamente, no un descuido.

## Por qué Postgres local hoy, Supabase en producción

El esquema (`db/schema.sql`) usa tipos y funciones nativas de Postgres estándar
(`gen_random_uuid()`, `TIMESTAMPTZ`, `JSONB`, triggers `plpgsql`) sin nada específico
de Docker, para que migrar a Supabase sea solo cambiar `DATABASE_URL`.

## Roadmap: pendientes explícitos, no descuidos

- **Metricool real** — `METRICOOL_API_KEY` ya existe en `.env.example`/`.env` (vacía).
  Falta construir `agents/marketing/metricool-client.ts` (mismo patrón que
  `agents/producto/tavily-client.ts`: un cliente delgado + envolver cualquier texto
  externo con `asUntrustedContent()`) y decidir el alcance exacto de la API antes de
  conectarlo.
- **Generación de creatividades (imágenes/video para ads)** — `CREATIVE_GENERATION_API_KEY`
  existe como placeholder. Sin proveedor elegido todavía; evaluar opciones (costo por
  generación, calidad, soporte de marca/plantillas) antes de comprometerse a uno -
  es una decisión de producto, no solo técnica.
- ~~Plataforma web pública multi-tenant~~ — **construida**: `web/` (Next.js 16 +
  Clerk), esquema multi-tenant (`tenants`, `agents.tenant_id`), panel admin y panel
  cliente con subida de archivos/fotos por gerencia. Ver README sección "Panel web".
- **Cobro real a las pymes** — decisión explícita de dejarlo fuera de este sprint. El
  admin gestiona plan/estado a mano; "ingresos" en `/admin` es `plan × pymes activas`,
  no una pasarela real. Integrar un procesador de pago chileno (Transbank/Flow/Khipu)
  queda para cuando corresponda facturar de verdad.
- ~~Sitio web + inventario para las pymes~~ — **construida (Fase 1)**: 10 plantillas
  de sitio (`web/components/site-templates/`, catálogo en `website_templates`),
  editor de colores/info básica en `/dashboard/sitio`, sitio público en
  `/sitio/<slug>`, inventario con stock/precio/fotos en `/dashboard/inventario`
  (tabla `products`), y `list_low_stock_products` avisando al Gerente de Producto
  cuando algo cae bajo su umbral de seguridad. De paso se cerró un gap real: la
  tabla `client_uploads` existía sin que ningún agente la leyera —
  `get_client_uploads` (agents/_shared/uploads-tool.ts) ya está conectada a los 6.
- **Pago real de terceros (dinero de LOS CLIENTES de cada pyme, cobro con tarjeta a
  la propia pyme, y envíos reales) — Fase 2, todavía no construida, pero ya con
  proveedor elegido.** Decisión confirmada: **Mercado Pago Marketplace/Application
  API** — OAuth por vendedor + `marketplace_fee` automático para Chile (Transbank
  Webpay Mall existe pero es onboarding comercial pesado, no self-serve; Flow/Khipu
  sin marketplace confirmado). Falta: que el usuario cree su cuenta de desarrollador
  en Mercado Pago y pase `client_id`/`client_secret` (no es algo que se pueda crear
  en su nombre), luego construir el flujo OAuth por pyme (`/dashboard/pagos`), un
  webhook receptor con tokens cifrados en reposo, y la tarjeta/cobro recurrente de
  la propia suscripción de AIdmin (hoy `/admin/tenants` gestiona plan/estado a
  mano). Para envíos, agregadores como Enviame.io/Shipit.cl (multi-courier, una
  sola integración) además de APIs directas de Chilexpress/Correos de
  Chile/Bluexpress. **Nota para el pitch**: el `marketplace_fee` de Mercado Pago le
  daría a AIdmin una segunda fuente de ingresos (comisión % sobre el GMV que
  procesan sus pymes) además del fee mensual fijo — no solo un SaaS de asiento fijo,
  sino uno con techo de ingresos ligado al éxito de ventas de sus clientes.
- ~~Pedidos de clientes finales (número, estado, despacho, correo automático)~~ —
  **construida, sin depender del pago online.** Como todavía no hay checkout real
  (ver punto anterior), `/dashboard/pedidos` deja que la pyme cargue el pedido ella
  misma (llega por WhatsApp/teléfono/redes, como hacen hoy la mayoría de las pymes
  chilenas) — número correlativo por pyme, estado (recibido → preparando →
  despachado → entregado/cancelado), tracking, y un correo automático al cliente
  FINAL (no al dueño de la pyme) en cada cambio de estado, vía Resend (tabla
  `orders`, `web/lib/orders.ts`). Cuando se conecte Mercado Pago, el checkout puede
  crear estas mismas filas en vez de que la pyme las tipee a mano.
- ~~Contrato aceptado al contratar~~ — **construida.** `tenants.terms_accepted_at`/
  `terms_accepted_by`, con una tarjeta bloqueante en `/dashboard` (`AcceptTermsCard`)
  hasta que el cliente marque que leyó `/terminos` y acepte.
- ~~Generar contenido con Marketing bajo demanda~~ — **construida.** En
  `/dashboard/content`, un formulario le pide a Marketing (como community manager)
  un post para una red + un brief, y lo genera en el momento con el mismo LLM
  liviano del chat del CEO (`web/lib/marketing-generate.ts`), dejándolo directo en
  `content_reviews` para aprobar/programar — no hace falta esperar a que Marketing
  corra solo. Reels/video con IA sigue sin proveedor elegido (ver item aparte).
- **Dominio propio / DNS** — el campo ya existe (`tenant_websites.custom_domain`,
  `/dashboard/sitio`) para no tener que volver a pedirlo, pero no hay provisión
  automática de DNS/SSL todavía (requeriría la API de dominios de Vercel + que el
  cliente sea dueño de un dominio real) — hoy el sitio solo vive en `/sitio/<slug>`.
- **Un futuro Gerente de Operaciones dedicado** — por ahora las alertas de stock
  viven en el Gerente de Producto (ya cubre "catálogo, costos y precios"); tiene
  sentido separarlo en su propio agente cuando el volumen de ventas real (Fase 2)
  lo justifique.
- ~~Base de conocimiento por gerente + alertas del CEO por correo~~ — **construida**:
  `/admin/agentes/<slug>` tiene una sección para cargar documentos/links de
  referencia globales por rol (tabla `agent_knowledge`), leída por los 6 agentes vía
  `get_agent_knowledge_base` (`agents/_shared/agent-knowledge-tool.ts`). El CEO
  (`agents/ceo/index.ts`) le manda un correo al dueño de la pyme (campo "Alertas por
  correo" en `/dashboard/negocio`, columna `business_context.owner_alert_email`)
  cuando arma la pauta y queda algo pendiente de aprobación/revisión — vía Resend
  (`agents/_shared/email.ts`, `RESEND_API_KEY`/`RESEND_FROM_EMAIL` en `.env`). Envío
  deshabilitado hasta que se configure una `RESEND_API_KEY` real.
- **WhatsApp bidireccional (chat en vivo con el CEO, "hacer cambios" por WhatsApp) —
  no implementado, solo documentado.** Requiere: un BSP (Twilio, 360dialog, o Meta
  Cloud API directo), un webhook receptor de mensajes entrantes, mapeo
  teléfono→tenant/sesión, y — el punto más importante — que el CEO deje de ser
  `recommend_only` y reciba herramientas de escritura reales para poder "hacer
  cambios" a pedido por chat. Eso último es un cambio de gobernanza (el CEO hoy no
  puede modificar nada, solo leer y recomendar) que merece su propia conversación
  explícita con el usuario antes de construirse — no es solo agregar una
  integración de mensajería más.
