# AIdmin

Plataforma que administra una pyme mediante agentes de IA autónomos (CEO, Marketing,
Finanzas, Producto, Desarrollo), coordinados entre sí, con trazabilidad completa y
controles humanos obligatorios en todo lo irreversible (dinero y marca pública). No es
un chatbot: son procesos autónomos que corren en background (por cron o por evento),
deciden dentro de límites explícitos, y dejan todo su razonamiento auditado en base de
datos.

Piloto actual: **FIRMA IA** (firmaia.cl).

Las fundaciones (base de datos, approval-gate, clase base `Agent`) y cinco agentes ya
están construidos de punta a punta, cada uno con nombre y personalidad propios:
**Mauricio** (Desarrollo, infraestructura), **Valentina** (Finanzas, primer uso real
del approval-gate), **Francisca** (Legal, revisión de cumplimiento), **Camila**
(Producto, único agente con acceso real a internet vía Tavily) y **Rodrigo** (CEO,
lee los reportes de todos y arma la **pauta de comité** diaria — así es como los
agentes "discuten": no chatean en vivo entre sí, el CEO cruza sus posiciones). Solo
falta Marketing (publicidad/redes, se construye en un sprint posterior); ver
[`docs/architecture.md`](docs/architecture.md) para la arquitectura completa y cómo
funciona el comité.

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

## Probar el CEO / Comité manualmente

Corre despues de los demás para tener reportes que leer:

```bash
npm run dev:desarrollo && npm run dev:finanzas && npm run dev:legal && npm run dev:producto
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
```

(Puertos configurables con `*_TRIGGER_PORT` en `.env`.)

Luego:

1. Abre n8n en [http://localhost:5678](http://localhost:5678) (la primera vez te
   pide crear una cuenta de owner - email/nombre/password, es solo para tu instancia
   local).
2. Importa los 5 workflows de `orchestrator/n8n/` (menú **⋯ → Import from File**):
   `desarrollo-daily-report.json`, `finanzas-cash-flow-review.json`,
   `legal-catalog-review.json`, `producto-market-research.json`,
   `ceo-comite-diario.json`.
3. Crea una credencial de tipo **Postgres** (host `postgres`, puerto `5432`, database/
   usuario/password = los valores de `POSTGRES_DB`/`POSTGRES_USER`/`POSTGRES_PASSWORD`
   de tu `.env`) y asígnala a los nodos Postgres de cada workflow.
4. Corre cada workflow manualmente desde el nodo **Disparo manual (test)** para
   probar de punta a punta: n8n llama al puente HTTP → el agente corre y escribe en
   Postgres → n8n confirma que quedó guardado. Corre el del CEO al final, para que
   tenga reportes recientes de los demás que leer.
5. Activa cada workflow (toggle **Active**) para que corran solos, en este orden por
   horario: Finanzas `0 7 * * *`, Desarrollo `0 8 * * *`, Legal `0 9 * * *`, Producto
   `30 9 * * *`, CEO `0 10 * * *` (con margen para que los demás ya hayan corrido).

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
  desarrollo/          # Mauricio: constitution.md, tools.ts, index.ts, trigger-server.ts
  finanzas/            # Valentina: idem, + propose_payment usando el approval-gate real
  legal/                # Francisca: revisa catalogo de documentos por cumplimiento
  producto/             # Camila: idem + tavily-client.ts (unico agente con web real)
  ceo/                  # Rodrigo: solo lectura (reports/approvals), arma la pauta de comite
approval-gate/          # modulo de aprobacion humana obligatoria + tests + servidor HTTP
orchestrator/n8n/       # workflows exportados de n8n (uno por agente)
db/                     # schema.sql, seed.sql
docs/architecture.md    # arquitectura completa de referencia + como funciona el comite
docker-compose.yml      # Postgres + n8n para desarrollo local
```

## Qué NO hace este sprint

- No conecta bancos, WhatsApp Business real, ni cuentas de ads reales.
- No implementa el agente de Marketing (el esquema de DB y la clase `Agent` ya lo
  soportan sin retrabajo, ver `docs/architecture.md`).
- Los agentes no chatean en vivo entre sí - "discuten" via síntesis secuencial: cada
  uno reporta independiente y el CEO cruza sus posiciones despues (ver
  `docs/architecture.md`, sección "El Comité").
- Desarrollo, Finanzas y Legal usan datos mock (sin Sentry/GitHub, SII/Fintoc,
  sistema documental real). Producto es la única excepción deliberada: tiene acceso
  real a internet vía Tavily. Finanzas nunca ejecuta una transferencia - solo deja
  propuestas en `pending_approval`; Legal y Producto nunca publican nada - solo dejan
  marcas/propuestas pendientes de revisión humana.
