# AIdmin

Plataforma que administra una pyme mediante agentes de IA autónomos (CEO, Marketing,
Finanzas, Producto, Desarrollo), coordinados entre sí, con trazabilidad completa y
controles humanos obligatorios en todo lo irreversible (dinero y marca pública). No es
un chatbot: son procesos autónomos que corren en background (por cron o por evento),
deciden dentro de límites explícitos, y dejan todo su razonamiento auditado en base de
datos.

Piloto actual: **FIRMA IA** (firmaia.cl).

Este sprint (Fase 0 + Fase 1) construye las fundaciones (base de datos, approval-gate,
clase base `Agent`) y **un único agente de punta a punta: el Gerente de Desarrollo**
(monitoreo de infraestructura — no toca dinero ni publica contenido de marca). Los
agentes de Finanzas, Marketing, Producto y CEO se construyen en sprints posteriores;
ver [`docs/architecture.md`](docs/architecture.md) para la arquitectura completa.

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

## Conectar n8n como orquestador

n8n solo hace de "reloj" (cron) y enrutador; para que pueda disparar al agente (que
corre como proceso Node en tu máquina, no dentro de Docker) necesitas levantar el
puente HTTP:

```bash
npm run dev:desarrollo:server
```

Esto expone `POST http://localhost:4100/run` (puerto configurable con
`DESARROLLO_TRIGGER_PORT`).

Luego:

1. Abre n8n en [http://localhost:5678](http://localhost:5678) (usuario/clave =
   `N8N_BASIC_AUTH_USER` / `N8N_BASIC_AUTH_PASSWORD` de tu `.env`).
2. Importa `orchestrator/n8n/desarrollo-daily-report.json` (menú **⋯ → Import from
   File**).
3. Crea una credencial de tipo **Postgres** (host `postgres`, puerto `5432`, database/
   usuario/password = los valores de `POSTGRES_DB`/`POSTGRES_USER`/`POSTGRES_PASSWORD`
   de tu `.env`) y asígnala al nodo **Confirmar reporte en DB**.
4. Corre el workflow manualmente desde el nodo **Disparo manual (test)** para probar
   de punta a punta: n8n llama al puente HTTP → el agente corre y escribe en
   Postgres → n8n confirma que el reporte quedó guardado.
5. Activa el workflow (toggle **Active**) para que corra solo, según el cron
   configurado (`0 8 * * *`, 08:00 todos los días).

> Nota: el nodo HTTP Request llama a `host.docker.internal`, que Docker Desktop
> resuelve automáticamente a tu máquina host. Si más adelante corres n8n en Linux sin
> Docker Desktop, cambia esa URL por la IP del host o usa `network_mode: host`.

## Canal humano (approvals)

El approval-gate impide que cualquier agente ejecute pagos, gastos, cambios de
presupuesto o campañas pagas por sí solo. En este sprint ningún agente construido
genera ese tipo de acciones todavía (el piloto es de bajo riesgo), pero el módulo ya
está listo para cuando se conecten Finanzas y Marketing. Para probarlo:

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
  _shared/            # clase base Agent, tipos, db, asUntrustedContent()
  desarrollo/          # agente piloto: constitution.md, tools.ts, index.ts
approval-gate/          # modulo de aprobacion humana obligatoria + tests + servidor HTTP
orchestrator/n8n/       # workflows exportados de n8n
db/                     # schema.sql, seed.sql
docs/architecture.md    # arquitectura completa de referencia (los 5 agentes)
docker-compose.yml      # Postgres + n8n para desarrollo local
```

## Qué NO hace este sprint

- No conecta bancos, WhatsApp Business real, ni cuentas de ads reales.
- No implementa los agentes de Finanzas, Marketing, Producto ni CEO (el esquema de DB
  y la clase `Agent` ya los soportan sin retrabajo, ver `docs/architecture.md`).
- El agente de Desarrollo solo monitorea una URL de sandbox y usa mocks para logs
  (Sentry) y GitHub - no hay credenciales reales de ningún proveedor externo.
