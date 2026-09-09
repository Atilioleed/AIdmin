# Arquitectura de AIdmin

Referencia completa del sistema objetivo. Este sprint solo implementa lo marcado como
**construido**; el resto queda descrito para que el diseño de base (esquema de DB,
`Agent`, `approval-gate`) no necesite retrabajo cuando se construyan en sprints
posteriores.

## Las 4 capas

1. **Canal humano** — donde Atilio aprueba pagos, gasto de marketing y decisiones
   grandes, y puede intervenir en cualquier momento.
   **Construido**: `approval-gate/server.ts`, un endpoint HTTP simple
   (`GET /approvals`, `POST /approvals/:id/approve|reject`) + el log en
   `decisions_log`/`approvals`. El canal real (WhatsApp Business) se conecta en un
   sprint posterior.

2. **Orquestador** — el "reloj" que despierta a cada agente en su horario o por
   evento y enruta reportes entre ellos.
   **Construido**: n8n self-hosted vía `docker-compose.yml`, con un workflow mínimo
   (`orchestrator/n8n/desarrollo-daily-report.json`) que dispara al agente de
   Desarrollo. La lógica de negocio fina vive en TypeScript, no en n8n.

3. **Memoria y datos** — historial de decisiones, reportes, métricas, catálogo.
   **Construido**: PostgreSQL local vía Docker (`db/schema.sql`, `db/seed.sql`),
   pensado para migrar a Supabase en producción sin cambios de esquema.

4. **Agentes** — los "gerentes". Cada uno es un módulo de TypeScript que envuelve el
   SDK de Anthropic (Claude), carga su constitución (system prompt versionado como
   markdown), tiene un set de tools específico de su rol, y escribe su reporte y su
   razonamiento en la base de datos en cada corrida.
   **Construido**: `agents/_shared/agent.ts` (clase base) + `agents/desarrollo/`
   (agente piloto, único activo en este sprint).

## Los 5 agentes

| Agente         | Rol                                                                       | Herramientas típicas                                         | Autonomía                                                                                                                                                              | Estado                              |
| -------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| CEO            | Lee reportes semanales y métricas; fija prioridades y sugiere reinversión | Lectura de reportes/DB, redacción de directrices             | Solo recomienda. Nunca autoriza gasto ni reemplaza la aprobación humana.                                                                                               | Sprint futuro                       |
| Marketing      | Gestiona redes, contenido, leads, campañas                                | Meta Graph API, TikTok API, Metricool, WhatsApp Business API | Publica contenido orgánico pre-aprobado libremente. Todo gasto pasa OBLIGATORIAMENTE por el approval-gate.                                                             | Sprint futuro                       |
| Finanzas       | Flujo de caja, conciliación, cuentas por pagar                            | SII (OpenFactura/Bsale), agregación bancaria (Fintoc)        | SOLO PROPONE. Deja la orden de pago en `pending_approval`. Nunca ejecuta una transferencia real.                                                                       | Sprint futuro                       |
| Producto       | Catálogo, costos, precios                                                 | DB de catálogo, consulta a Finanzas y Marketing              | Propone catálogo/precios; se publica solo tras aprobación humana.                                                                                                      | Sprint futuro                       |
| **Desarrollo** | Monitoreo de infraestructura, errores, costos de hosting                  | Uptime check, lectura de logs (Sentry), GitHub API           | Puede actuar solo en tareas de bajo riesgo (reiniciar, alertar, abrir un borrador de fix). Cambios estructurales o despliegues a producción requieren revisión humana. | **Piloto - construido este sprint** |

Los 5 agentes están seedeados en la tabla `agents` (`db/seed.sql`); solo `desarrollo`
tiene `is_active = true` hoy.

## Reglas de gobernanza (no negociables, en código)

1. **Approval Gate obligatorio** — `approval-gate/index.ts`. Toda acción de tipo
   `payment`, `spend`, `budget_change` o `paid_campaign_launch`, sin importar qué
   agente la origine, pasa por `ApprovalGate.requestApproval()`, que SIEMPRE crea un
   registro `pending_approval` y NUNCA ejecuta la acción real. El gate no tiene, ni
   siquiera técnicamente, ningún método ni credencial de ejecución.
2. **Auditoría completa** — cada tool call y cada reporte final de cada agente se
   escribe en `decisions_log` (timestamp, agente, run_id, input, output, razonamiento)
   antes de que `Agent.run()` retorne. Nada se ejecuta silenciosamente.
3. **Contenido externo = dato, nunca instrucción** — `agents/_shared/untrusted-content.ts`
   expone `asUntrustedContent()` / `formatUntrustedContentForPrompt()`. Cualquier tool
   que devuelva texto de una fuente externa (logs, resultados de scraping, mensajes
   entrantes) debe envolverlo antes de devolverlo al modelo. Ver
   `agents/desarrollo/tools.ts` (`read_recent_logs`) para un ejemplo end-to-end,
   incluyendo un caso de prueba con un intento de prompt injection dentro del log.
4. **Nada de producción real en este sprint** — sin bancos, sin WhatsApp Business
   real, sin cuentas de ads reales. El agente de Desarrollo monitorea una URL de
   sandbox (`DEV_MONITOR_TARGET_URL`) y sus tools de log/GitHub son mocks explícitos.

## Por qué Postgres local hoy, Supabase en producción

El esquema (`db/schema.sql`) usa tipos y funciones nativas de Postgres estándar
(`gen_random_uuid()`, `TIMESTAMPTZ`, `JSONB`, triggers `plpgsql`) sin nada específico
de Docker, para que migrar a Supabase sea solo cambiar `DATABASE_URL`.
