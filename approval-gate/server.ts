// Canal humano (seccion 3): endpoint HTTP simple para que Atilio vea approvals
// pendientes y las apruebe/rechace. En un sprint posterior esto se reemplaza o se
// complementa con WhatsApp Business; la logica de negocio (el gate) no cambia.
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { getPool } from '../agents/_shared/db.js';
import { ApprovalGate } from './index.js';
import { PgApprovalsRepository } from './pg-approvals-repository.js';

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req as AsyncIterable<Buffer>) {
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>;
  } catch {
    throw new Error('Body invalido: se esperaba JSON.');
  }
}

export function createApprovalGateServer(gate: ApprovalGate): Server {
  return createServer((req, res) => {
    void handleRequest(gate, req, res).catch((error: unknown) => {
      sendJson(res, 500, { error: error instanceof Error ? error.message : 'Error interno.' });
    });
  });
}

async function handleRequest(
  gate: ApprovalGate,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const url = new URL(req.url ?? '/', 'http://localhost');

  if (req.method === 'GET' && url.pathname === '/health') {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/approvals') {
    const pending = await gate.listPending();
    sendJson(res, 200, { approvals: pending });
    return;
  }

  const decisionMatch = /^\/approvals\/([^/]+)\/(approve|reject)$/.exec(url.pathname);
  if (req.method === 'POST' && decisionMatch) {
    const id = decisionMatch[1] as string;
    const decision = decisionMatch[2] as 'approve' | 'reject';
    const body = await readJsonBody(req);
    const resolvedBy = typeof body.resolvedBy === 'string' ? body.resolvedBy : undefined;
    if (!resolvedBy) {
      sendJson(res, 400, { error: 'resolvedBy es requerido (quien aprueba/rechaza).' });
      return;
    }
    const notes = typeof body.notes === 'string' ? body.notes : undefined;

    const existing = await gate.getById(id);
    if (!existing) {
      sendJson(res, 404, { error: `Approval ${id} no existe.` });
      return;
    }

    const resolved =
      decision === 'approve'
        ? await gate.approve(id, resolvedBy, notes)
        : await gate.reject(id, resolvedBy, notes);
    sendJson(res, 200, { approval: resolved });
    return;
  }

  sendJson(res, 404, { error: 'Ruta no encontrada.' });
}

export function startApprovalGateServer(port: number): Server {
  const gate = new ApprovalGate(new PgApprovalsRepository(getPool()));
  const server = createApprovalGateServer(gate);
  server.listen(port, () => {
    console.log(`[approval-gate] canal humano escuchando en http://localhost:${port}`);
  });
  return server;
}

const isMainModule = process.argv[1]?.endsWith('server.ts') ?? false;
if (isMainModule) {
  const port = Number(process.env.APPROVAL_GATE_PORT ?? 4000);
  startApprovalGateServer(port);
}
