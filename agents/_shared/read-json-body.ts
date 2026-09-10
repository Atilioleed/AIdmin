import type { IncomingMessage } from 'node:http';

// Compartido por los trigger-server.ts de cada agente y los gates: lee un body JSON
// opcional (p.ej. { tenantId } que manda el panel web al disparar una corrida).
export async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
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
