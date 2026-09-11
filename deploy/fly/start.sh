#!/bin/sh
# Arranca n8n + un solo proceso Node que agrupa los 8 servidores HTTP livianos
# (approval-gate, content-gate y los 6 trigger-servers de los agentes - ver
# all-servers.ts). Agruparlos en un proceso en vez de 8 separados es lo que hace que
# esto entre comodo en una maquina de memoria acotada. Si cualquiera de los dos
# muere, el script termina y Fly reinicia toda la maquina - simple y suficiente para
# este MVP. POSIX puro (sin bashismos) porque no se puede asumir que la imagen base
# tenga bash instalado.
set -e

mkdir -p "$N8N_USER_FOLDER"

echo "[start] arrancando n8n..."
n8n start &
PIDS="$!"

echo "[start] arrancando los 8 servidores HTTP (approval-gate, content-gate, 6 agentes)..."
node /app/dist/deploy/fly/all-servers.js &
PIDS="$PIDS $!"

echo "[start] procesos arrancados (pids: $PIDS)"

while true; do
  for pid in $PIDS; do
    if ! kill -0 "$pid" 2>/dev/null; then
      echo "[start] el proceso $pid murio, terminando el contenedor para que Fly lo reinicie."
      exit 1
    fi
  done
  sleep 5
done
