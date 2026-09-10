// Cliente delgado hacia approval-gate/server.ts y content-gate/server.ts (los mismos
// servidores HTTP que ya usa n8n). El panel web nunca decide el estado de un
// approval/content_review por su cuenta - siempre delega en esos servidores, que a su
// vez delegan en ApprovalGate/ContentGate. Ver docs/architecture.md.

const APPROVAL_GATE_URL = process.env.APPROVAL_GATE_URL ?? 'http://localhost:4000';
const CONTENT_GATE_URL = process.env.CONTENT_GATE_URL ?? 'http://localhost:4001';

async function postDecision(
  baseUrl: string,
  path: string,
  resolvedBy: string,
  notes?: string,
): Promise<void> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resolvedBy, notes }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `El gate respondio ${response.status}`);
  }
}

export async function approveApproval(id: string, resolvedBy: string, notes?: string): Promise<void> {
  await postDecision(APPROVAL_GATE_URL, `/approvals/${id}/approve`, resolvedBy, notes);
}

export async function rejectApproval(id: string, resolvedBy: string, notes?: string): Promise<void> {
  await postDecision(APPROVAL_GATE_URL, `/approvals/${id}/reject`, resolvedBy, notes);
}

export async function approveContentReview(id: string, resolvedBy: string, notes?: string): Promise<void> {
  await postDecision(CONTENT_GATE_URL, `/content-reviews/${id}/approve`, resolvedBy, notes);
}

export async function rejectContentReview(id: string, resolvedBy: string, notes?: string): Promise<void> {
  await postDecision(CONTENT_GATE_URL, `/content-reviews/${id}/reject`, resolvedBy, notes);
}
