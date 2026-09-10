// Puente HTTP minimo para que n8n dispare al agente Legal (mismo patron que
// agents/desarrollo/trigger-server.ts - ver ese archivo para el porque).
import 'dotenv/config';
import { createServer, type Server, type ServerResponse } from 'node:http';
import { runLegalAgent } from './index.js';

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

export function startLegalTriggerServer(port: number): Server {
  const server = createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === 'POST' && req.url === '/run') {
      runLegalAgent()
        .then((result) => {
          sendJson(res, 200, { ok: true, ...result });
        })
        .catch((error: unknown) => {
          sendJson(res, 500, {
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          });
        });
      return;
    }

    sendJson(res, 404, { error: 'Ruta no encontrada.' });
  });

  server.listen(port, () => {
    console.log(`[legal] trigger server escuchando en http://localhost:${port}`);
  });
  return server;
}

const isMainModule = process.argv[1]?.endsWith('trigger-server.ts') ?? false;
if (isMainModule) {
  const port = Number(process.env.LEGAL_TRIGGER_PORT ?? 4102);
  startLegalTriggerServer(port);
}
