# Imagen para Fly.io: arranca desde la imagen OFICIAL de n8n (la misma que usa
# docker-compose.yml en local) y le suma los 6 trigger-servers de los agentes +
# approval-gate + content-gate, todos como procesos Node aparte, en el mismo
# contenedor (comunicacion interna por localhost). Los procesos Node corren
# JavaScript ya compilado (no tsx) - en un servidor con memoria acotada, tsx duplica
# procesos por script (loader + esbuild worker) y se queda sin RAM con varios
# scripts corriendo a la vez.

# --- Etapa de build: compila TypeScript -> JavaScript plano ---
FROM node:22-alpine AS builder
WORKDIR /build
COPY package.json package-lock.json* tsconfig.json ./
RUN npm ci
COPY agents ./agents
COPY approval-gate ./approval-gate
COPY content-gate ./content-gate
COPY db ./db
COPY deploy ./deploy
RUN npm run build

# --- Etapa final: n8n + los procesos ya compilados ---
FROM n8nio/n8n:2.37.10

USER root
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /build/dist ./dist
COPY orchestrator ./orchestrator

COPY deploy/fly/start.sh /app/start.sh
RUN chmod +x /app/start.sh

ENV N8N_PORT=5678 \
    APPROVAL_GATE_PORT=4000 \
    CONTENT_GATE_PORT=4001 \
    DESARROLLO_TRIGGER_PORT=4100 \
    FINANZAS_TRIGGER_PORT=4101 \
    LEGAL_TRIGGER_PORT=4102 \
    PRODUCTO_TRIGGER_PORT=4103 \
    CEO_TRIGGER_PORT=4104 \
    MARKETING_TRIGGER_PORT=4105 \
    GENERIC_TIMEZONE=America/Santiago \
    N8N_USER_FOLDER=/data/.n8n

EXPOSE 5678 4000 4001

ENTRYPOINT []
CMD ["/app/start.sh"]
