# AIdmin

Plataforma que administra una pyme mediante agentes de IA autónomos (CEO, Marketing,
Finanzas, Producto, Desarrollo), coordinados entre sí, con trazabilidad completa y
controles humanos obligatorios en todo lo irreversible (dinero y marca pública). No es
un chatbot: son procesos autónomos que corren en background (por cron o por evento),
deciden dentro de límites explícitos, y dejan todo su razonamiento auditado en base de
datos.

Piloto actual: **FIRMA IA** (firmaia.cl).

Las fundaciones (base de datos, approval-gate, clase base `Agent`) y dos agentes ya
están construidos de punta a punta: **Desarrollo** (monitoreo de infraestructura, no
toca dinero) y **Finanzas** (flujo de caja y cuentas por pagar — el primero que
genera acciones reales de tipo `payment`, siempre a través del approval-gate). Los
agentes de Marketing, Producto y CEO se construyen en sprints posteriores, uno a la
vez; ver [`docs/architecture.md`](docs/architecture.md) para la arquitectura
completa.

## Requisitos

- [Node.js](https://nodejs.org/) 20 o superior (probado con Node 24).
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para Postgres y
  n8n locales).
- Una API key de Anthropic ([console.anthropic.com](https://console.anthropic.com)).

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

## Conectar n8n como orquestador

n8n solo hace de "reloj" (cron) y enrutador; para que pueda disparar a un agente (que
corre como proceso Node en tu máquina, no dentro de Docker) necesitas levantar su
puente HTTP:

```bash
npm run dev:desarrollo:server   # expone POST http://localhost:4100/run
npm run dev:finanzas:server     # expone POST http://localhost:4101/run
```

(Puertos configurables con `DESARROLLO_TRIGGER_PORT` / `FINANZAS_TRIGGER_PORT`.)

Luego:

1. Abre n8n en [http://localhost:5678](http://localhost:5678) (la primera vez te
   pide crear una cuenta de owner - email/nombre/password, es solo para tu instancia
   local).
2. Importa `orchestrator/n8n/desarrollo-daily-report.json` y
   `orchestrator/n8n/finanzas-cash-flow-review.json` (menú **⋯ → Import from File**).
3. Crea una credencial de tipo **Postgres** (host `postgres`, puerto `5432`, database/
   usuario/password = los valores de `POSTGRES_DB`/`POSTGRES_USER`/`POSTGRES_PASSWORD`
   de tu `.env`) y asígnala a los nodos Postgres de cada workflow.
4. Corre cada workflow manualmente desde el nodo **Disparo manual (test)** para
   probar de punta a punta: n8n llama al puente HTTP → el agente corre y escribe en
   Postgres → n8n confirma que el reporte (y, en Finanzas, las approvals generadas)
   quedaron guardados.
5. Activa cada workflow (toggle **Active**) para que corran solos, según su cron
   (`0 8 * * *` Desarrollo, `0 7 * * *` Finanzas).

> Nota: el nodo HTTP Request llama a `host.docker.internal`, que Docker Desktop
> resuelve automáticamente a tu máquina host. Si más adelante corres n8n en Linux sin
> Docker Desktop, cambia esa URL por la IP del host o usa `network_mode: host`.

## Canal humano (approvals)

El approval-gate impide que cualquier agente ejecute pagos, gastos, cambios de
presupuesto o campañas pagas por sí solo. El agente de Finanzas ya lo usa de verdad
(`propose_payment`); Marketing lo usará igual para `paid_campaign_launch`/
`budget_change` cuando se construya. Para probarlo directo:

```bash
npm run dev:approval-gate
```

```bash
# Ver approvals pendientes
curl http://localhost:4000/approvals

# Aprobar una (reemplaza :id)
curl -X POST http://localhost:4000/approvals/:id/approve \
  -H "Content-Type: application/json" \
  -d '{"resolvedBy": "atilio", "notes": "ok"}'
```

## Estructura del repositorio

```
agents/
  _shared/            # clase base Agent, tipos, db, asUntrustedContent(), llm-client-factory
  desarrollo/          # constitution.md, tools.ts, index.ts, trigger-server.ts
  finanzas/            # idem, + propose_payment usando el approval-gate real
approval-gate/          # modulo de aprobacion humana obligatoria + tests + servidor HTTP
orchestrator/n8n/       # workflows exportados de n8n (uno por agente)
db/                     # schema.sql, seed.sql
docs/architecture.md    # arquitectura completa de referencia (los 5 agentes)
docker-compose.yml      # Postgres + n8n para desarrollo local
```

## Qué NO hace este sprint

- No conecta bancos, WhatsApp Business real, ni cuentas de ads reales.
- No implementa los agentes de Marketing, Producto ni CEO (el esquema de DB y la
  clase `Agent` ya los soportan sin retrabajo, ver `docs/architecture.md`).
- Desarrollo solo monitorea una URL de sandbox y usa mocks para logs (Sentry) y
  GitHub. Finanzas usa datos mock de flujo de caja/facturas (sin SII/Fintoc reales) y
  nunca ejecuta una transferencia - solo deja propuestas en `pending_approval`.
