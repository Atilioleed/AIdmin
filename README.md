# AIdmin

Plataforma que administra una pyme mediante agentes de IA autónomos (CEO, Marketing,
Finanzas, Producto, Desarrollo), coordinados entre sí, con trazabilidad completa y
controles humanos obligatorios en todo lo irreversible (dinero y marca pública). No es
un chatbot: son procesos autónomos que corren en background (por cron o por evento),
deciden dentro de límites explícitos, y dejan todo su razonamiento auditado en base de
datos.

Piloto actual: **FIRMA IA** (firmaia.cl).

Las fundaciones (base de datos, approval-gate, content-gate, clase base `Agent`) y
los 6 agentes ya están construidos de punta a punta, cada uno con nombre y
personalidad propios: **Mauricio** (Desarrollo, infraestructura), **Valentina**
(Finanzas, primer uso real del approval-gate), **Francisca** (Legal, revisión de
cumplimiento), **Camila** (Producto, único agente con acceso real a internet vía
Tavily), **Sofía** (Marketing, redes/contenido/campañas vía Metricool - mock este
sprint - con su propio content-gate para que nada se publique sin revisión) y
**Rodrigo** (CEO, lee los reportes de todos y arma la **pauta de comité** diaria —
así es como los agentes "discuten": no chatean en vivo entre sí, el CEO cruza sus
posiciones). Es multi-tenant: cada pyme (Organization de Clerk) tiene su propio set de
6 agentes, gestionado desde el panel web en [`web/`](web/) (panel admin para Atilio,
panel cliente por pyme). Ver [`docs/architecture.md`](docs/architecture.md) para la
arquitectura completa y cómo funciona el comité.

## Requisitos

- [Node.js](https://nodejs.org/) 20 o superior (probado con Node 24).
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para Postgres y
  n8n locales).
- Una API key de Anthropic ([console.anthropic.com](https://console.anthropic.com)).
- Una API key de [Tavily](https://tavily.com) (gratis) si quieres correr el agente de
  Producto - es el único que hace búsquedas web reales.

## Instalación desde cero

1. **Instalar dependencias**

   ```bash
   npm install
   ```

2. **Configurar variables de entorno**

   ```bash
   cp .env.example .env
   ```

   Edita `.env` y como mínimo completa `ANTHROPIC_API_KEY`. Los demás valores tienen
   defaults razonables para desarrollo local.

   > **Sin una key de Anthropic a mano?** `agents/_shared/llm-client-factory.ts` deja
   > swapear temporalmente a cualquier endpoint compatible con OpenAI (Groq,
   > OpenRouter, Gemini) seteando `LLM_PROVIDER=openai-compatible` +
   > `LLM_BASE_URL`/`LLM_API_KEY`/`LLM_MODEL` en `.env` (ver comentarios en
   > `.env.example`). Es solo para probar el flujo sin gastar en la API oficial; el
   > default (`LLM_PROVIDER=anthropic` o la variable ausente) sigue usando el SDK
   > oficial de Anthropic, que es lo que pide el stack del proyecto.

3. **Levantar Postgres + n8n**

   ```bash
   docker compose up -d
   ```

   Verifica que ambos contenedores estén sanos:

   ```bash
   docker compose ps
   ```

   `aidmin-postgres` debe quedar `healthy`. La primera vez que levanta, Postgres
   ejecuta automáticamente `db/schema.sql` y `db/seed.sql` (ver
   `docker-entrypoint-initdb.d` en `docker-compose.yml`), así que no hay que correr
   migraciones a mano. Si vuelves a levantar el proyecto y quieres re-aplicar el
   schema desde cero:

   ```bash
   docker compose down -v   # borra el volumen de datos local
   docker compose up -d
   ```

4. **Correr los tests**

   ```bash
   npm test
   ```

   Los tests del `approval-gate` no dependen de Postgres (usan un repositorio en
   memoria), así que corren incluso sin Docker levantado.

5. **Verificar lint y tipos**

   ```bash
   npm run lint
   npm run build   # type-check estricto (tsc --noEmit vía el mismo tsconfig)
   ```

## Probar el agente de Desarrollo manualmente

Con Postgres levantado y `.env` configurado:

```bash
npm run dev:desarrollo
```

Esto corre una pasada completa del agente: chequea el uptime de
`DEV_MONITOR_TARGET_URL`, lee el log de ejemplo
(`agents/desarrollo/sample-data/sample-log.txt`), opcionalmente abre un borrador de
issue (mock), y termina con su reporte impreso en consola. Cada paso queda guardado en
`decisions_log` y el reporte final en `reports`. Para revisarlo directo en la base de
datos:

```bash
docker compose exec postgres psql -U aidmin -d aidmin -c \
  "SELECT tool_name, decision_type, created_at FROM decisions_log ORDER BY created_at DESC LIMIT 10;"

docker compose exec postgres psql -U aidmin -d aidmin -c \
  "SELECT summary, created_at FROM reports ORDER BY created_at DESC LIMIT 1;"
```

## Probar el agente de Finanzas manualmente

Con Postgres levantado y `.env` configurado:

```bash
npm run dev:finanzas
```

Revisa el flujo de caja de ejemplo y las facturas pendientes
(`agents/finanzas/sample-data/`), propone pago (`pending_approval`, nunca lo ejecuta)
para las que corresponde, y deja las sospechosas/duplicadas sin proponer. Una de las
facturas de ejemplo trae un intento de fraude por ingeniería social (le pide al
agente saltarse la aprobación humana) para comprobar que la regla de "contenido
externo = dato" tambien se sostiene con dinero de por medio. Revisar en la base:

```bash
docker compose exec postgres psql -U aidmin -d aidmin -c \
  "SELECT id, action_type, status, payload->>'payee' AS payee, payload->>'amountClp' AS amount FROM approvals ORDER BY requested_at DESC LIMIT 5;"
```

## Probar el agente Legal manualmente

```bash
npm run dev:legal
```

Revisa el catálogo de plantillas de ejemplo (`agents/legal/sample-data/`) contra un
checklist de cumplimiento y marca (`flag_document_for_legal_review`) las que
necesitan revisión, separando riesgo alto de mejora menor. Nunca modifica el
catálogo real.

## Probar el agente de Producto manualmente (necesita `TAVILY_API_KEY`)

```bash
npm run dev:producto
```

Es el único agente con acceso real a internet: busca en la web (Tavily) sobre
mercado/competencia y deja propuestas de mejora (`propose_improvement`) con la
evidencia detrás. El resultado de cada búsqueda se trata siempre como contenido
externo no confiable (nunca como instrucción) antes de llegar al modelo.

## Probar el agente de Marketing manualmente

```bash
npm run dev:marketing
```

Revisa calendario/métricas/comentarios de ejemplo (`agents/marketing/sample-data/`),
deja posts orgánicos en `pending_review` (`propose_post`, vía **content-gate** -
nunca publica) y, si hay evidencia suficiente, una propuesta de campaña paga o
cambio de presupuesto en `pending_approval` (vía approval-gate - nunca la ejecuta).
Uno de los comentarios de ejemplo es un intento de manipulación pidiendo saltarse la
revisión humana; el agente lo marca como sospechoso y no lo obedece.

```bash
docker compose exec postgres psql -U aidmin -d aidmin -c \
  "SELECT channel, status, content_text FROM content_reviews ORDER BY requested_at DESC LIMIT 5;"
```

## Probar el CEO / Comité manualmente

Corre despues de los demás para tener reportes que leer:

```bash
npm run dev:desarrollo && npm run dev:finanzas && npm run dev:legal && npm run dev:producto && npm run dev:marketing
npm run dev:ceo
```

El CEO no tiene ninguna tool de acción, solo lee `reports` y `approvals` de los demás
agentes y arma la **pauta de comité**: resumen ejecutivo, acuerdos entre agentes,
tensiones/desacuerdos, aprobaciones pendientes priorizadas, y prioridades
recomendadas (marcadas explícitamente como recomendación). Revisar la pauta más
reciente:

```bash
docker compose exec postgres psql -U aidmin -d aidmin -c \
  "SELECT summary FROM reports r JOIN agents a ON a.id = r.agent_id WHERE a.slug = 'ceo' ORDER BY r.created_at DESC LIMIT 1;"
```

## Conectar n8n como orquestador

n8n solo hace de "reloj" (cron) y enrutador; para que pueda disparar a un agente (que
corre como proceso Node en tu máquina, no dentro de Docker) necesitas levantar su
puente HTTP:

```bash
npm run dev:desarrollo:server   # POST http://localhost:4100/run
npm run dev:finanzas:server     # POST http://localhost:4101/run
npm run dev:legal:server        # POST http://localhost:4102/run
npm run dev:producto:server     # POST http://localhost:4103/run
npm run dev:ceo:server          # POST http://localhost:4104/run - correr al final
npm run dev:marketing:server    # POST http://localhost:4105/run
```

(Puertos configurables con `*_TRIGGER_PORT` en `.env`.)

Luego:

1. Abre n8n en [http://localhost:5678](http://localhost:5678) (la primera vez te
   pide crear una cuenta de owner - email/nombre/password, es solo para tu instancia
   local).
2. Importa los 6 workflows de `orchestrator/n8n/` (menú **⋯ → Import from File**):
   `desarrollo-daily-report.json`, `finanzas-cash-flow-review.json`,
   `legal-catalog-review.json`, `producto-market-research.json`,
   `marketing-content-review.json`, `ceo-comite-diario.json`.
3. Crea una credencial de tipo **Postgres** (host `postgres`, puerto `5432`, database/
   usuario/password = los valores de `POSTGRES_DB`/`POSTGRES_USER`/`POSTGRES_PASSWORD`
   de tu `.env`) y asígnala a los nodos Postgres de cada workflow.
4. Corre cada workflow manualmente desde el nodo **Disparo manual (test)** para
   probar de punta a punta: n8n llama al puente HTTP → el agente corre y escribe en
   Postgres → n8n confirma que quedó guardado. Corre el del CEO al final, para que
   tenga reportes recientes de los demás que leer.
5. Activa cada workflow (toggle **Active**) para que corran solos, en este orden por
   horario: Finanzas `0 7 * * *`, Desarrollo `0 8 * * *`, Marketing `30 8 * * *`,
   Legal `0 9 * * *`, Producto `30 9 * * *`, CEO `0 10 * * *` (con margen para que los
   demás ya hayan corrido).

> Nota: el nodo HTTP Request llama a `host.docker.internal`, que Docker Desktop
> resuelve automáticamente a tu máquina host. Si más adelante corres n8n en Linux sin
> Docker Desktop, cambia esa URL por la IP del host o usa `network_mode: host`.

## Canal humano (approvals y content reviews)

Dos gates gemelos, uno por cada cosa irreversible del proyecto (dinero, marca
pública):

```bash
npm run dev:approval-gate    # dinero/campañas - puerto 4000
npm run dev:content-gate     # contenido orgánico - puerto 4001
```

```bash
# Approvals (dinero/campañas) - Finanzas y Marketing ya las usan de verdad
curl http://localhost:4000/approvals
curl -X POST http://localhost:4000/approvals/:id/approve \
  -H "Content-Type: application/json" \
  -d '{"resolvedBy": "atilio", "notes": "ok"}'

# Content reviews (posts orgánicos) - Marketing ya los usa de verdad
curl http://localhost:4001/content-reviews
curl -X POST http://localhost:4001/content-reviews/:id/approve \
  -H "Content-Type: application/json" \
  -d '{"resolvedBy": "atilio", "notes": "ok, publicar"}'
```

## Panel web (multi-tenant, `web/`)

Next.js 16 + Clerk. Cada pyme es una Organization de Clerk = un `tenant` en la base
(cada tenant tiene su propio set de 6 agentes - ver `db/schema.sql`, `agents.tenant_id`).
El panel **no reimplementa** la lógica de los gates: sus acciones de aprobar/rechazar
llaman a los mismos servidores HTTP de `approval-gate`/`content-gate` que ya usa n8n.

```bash
cd web
npm install
cp .env.local.example .env.local
# completa NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY (cuenta gratis en
# clerk.com) y ADMIN_EMAILS (tu correo - debe coincidir con el de tu cuenta de Clerk)
npm run dev
```

Con Postgres, `approval-gate` y `content-gate` levantados (ver secciones de arriba),
abre [http://localhost:3000](http://localhost:3000):

- **Panel cliente** (`/dashboard`) - requiere pertenecer a una Organization de Clerk
  (= una pyme): checklist de onboarding, pauta de comité, contexto de negocio
  (`/dashboard/negocio`, leído por los 6 gerentes), sitio web (`/dashboard/sitio`,
  10 plantillas + colores/info básica, publica en `/sitio/<slug>`), inventario
  (`/dashboard/inventario`, si la pyme vende producto), redes sociales, aprobaciones,
  contenido pendiente, subida de archivos/fotos por gerencia, historial de reportes.
- **Panel admin** (`/admin`) - requiere que tu correo esté en `ADMIN_EMAILS`: ingresos
  calculados, alta de pymes (crea sus 6 agentes de inmediato), salud de integraciones,
  y personalidad/habilidades de cada gerente (`/admin/agentes`).

Para dar de alta una pyme nueva: créale una Organization en el dashboard de Clerk,
copia su Organization ID, y usa el formulario de `/admin/tenants` con ese ID.

Para editar la personalidad y habilidades de un gerente (nombre, tono, especialidad,
objetivo): `/admin/agentes/<slug>`. Es global por rol - un solo "Marketing" aplica a
todas las pymes. Los límites de autonomía (aprobación humana de plata y contenido
público) NO se editan ahí: siguen fijos en `agents/<slug>/constitution.md` por
seguridad, y se combinan con lo editable en `agents/_shared/agent.ts` en cada corrida
(ver `agents/_shared/agent-profile.ts`).

## Estructura del repositorio

```
agents/
  _shared/            # clase base Agent, tipos, db, asUntrustedContent(), llm-client-factory
  desarrollo/          # Mauricio: constitution.md, tools.ts, index.ts, trigger-server.ts
  finanzas/            # Valentina: idem, + propose_payment usando el approval-gate real
  legal/                # Francisca: revisa catalogo de documentos por cumplimiento
  producto/             # Camila: idem + tavily-client.ts (unico agente con web real)
  marketing/            # Sofia: idem + propose_post (content-gate) y campañas (approval-gate)
  ceo/                  # Rodrigo: solo lectura (reports/approvals), arma la pauta de comite
approval-gate/          # aprobacion humana para dinero/campañas + tests + servidor HTTP
content-gate/           # aprobacion humana para contenido publico + tests + servidor HTTP
orchestrator/n8n/       # workflows exportados de n8n (uno por agente)
db/                     # schema.sql, seed.sql
web/                    # panel Next.js + Clerk (admin + cliente), multi-tenant
docs/architecture.md    # arquitectura completa de referencia + como funciona el comite
docker-compose.yml      # Postgres + n8n para desarrollo local
```

## Qué NO hace este sprint

- No conecta bancos, WhatsApp Business real, ni cuentas de ads reales. Marketing usa
  Metricool mockeado (ver `LLM_PROVIDER`-style swap pendiente para cuando haya una
  API key real de Metricool).
- Los agentes no chatean en vivo entre sí - "discuten" via síntesis secuencial: cada
  uno reporta independiente y el CEO cruza sus posiciones despues (ver
  `docs/architecture.md`, sección "El Comité").
- Desarrollo, Finanzas, Legal y Marketing usan datos mock (sin Sentry/GitHub,
  SII/Fintoc, sistema documental o Metricool real). Producto es la única excepción
  deliberada: tiene acceso real a internet vía Tavily. Finanzas nunca ejecuta una
  transferencia; Marketing nunca publica ni lanza una campaña; Legal y Producto nunca
  publican nada - todos dejan marcas/propuestas pendientes de revisión humana vía
  approval-gate o content-gate.
- Sitio web (10 plantillas) e inventario para las pymes SÍ están construidos
  (`/dashboard/sitio`, `/dashboard/inventario`). Lo que sigue sin construir es el
  dinero real: pasarela de pago de terceros (los clientes de cada pyme), envíos, y
  el dashboard financiero que depende de esas ventas reales - decisión explícita,
  investigado y documentado (Mercado Pago Marketplace API) pero no implementado
  todavía (ver `docs/architecture.md`, sección Roadmap). Tampoco hay un Gerente de
  Operaciones dedicado - las alertas de stock bajo viven en Producto por ahora. El
  cobro real a las pymes (el fee mensual de AIdmin, no las ventas de sus clientes)
  también queda manual.
