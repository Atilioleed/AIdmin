import type { Pool } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import { ApprovalGate } from '../../approval-gate/index.js';
import type { ApprovalRecord, ApprovalsRepository } from '../../approval-gate/types.js';
import type { AgentTool, AgentToolContext } from '../_shared/agent.js';
import { createFinanzasTools } from './tools.js';

// get_business_context no se ejercita en estos tests (solo se construye), pero
// createFinanzasTools igual necesita un Pool para armarla.
const fakePool = { query: () => Promise.reject(new Error('not used in this test')) } as unknown as Pool;

// Mismo patron que approval-gate.test.ts: un repositorio en memoria para no depender
// de una Postgres real en este test.
function createInMemoryRepository(): ApprovalsRepository & { records: ApprovalRecord[] } {
  const records: ApprovalRecord[] = [];
  let seq = 0;

  return {
    records,
    insertPending(request) {
      const record: ApprovalRecord = {
        id: `test-approval-${(seq += 1)}`,
        agentId: request.agentId,
        runId: request.runId ?? null,
        actionType: request.actionType,
        payload: request.payload,
        status: 'pending_approval',
        requestedAt: new Date(),
        resolvedAt: null,
        resolvedBy: null,
        resolutionNotes: null,
      };
      records.push(record);
      return Promise.resolve(record);
    },
    findById(id) {
      return Promise.resolve(records.find((r) => r.id === id) ?? null);
    },
    listByStatus(status) {
      return Promise.resolve(records.filter((r) => r.status === status));
    },
    resolve() {
      return Promise.reject(new Error('not used in this test'));
    },
  };
}

function getProposePaymentTool(tools: AgentTool[]): AgentTool {
  const tool = tools.find((t) => t.name === 'propose_payment');
  if (!tool) throw new Error('propose_payment tool not found');
  return tool;
}

describe('Finanzas propose_payment tool', () => {
  const context: AgentToolContext = { agentId: 'agent-finanzas-1', runId: 'run-1' };

  it('siempre deja la propuesta en pending_approval via el approval-gate real', async () => {
    const repo = createInMemoryRepository();
    const gate = new ApprovalGate(repo);
    const tool = getProposePaymentTool(createFinanzasTools('tenant-test-1', gate, fakePool));

    const result = (await tool.execute(
      {
        invoiceId: 'INV-1044',
        payee: 'AWS Chile SpA',
        amountClp: 850000,
        dueDate: '2026-09-15',
        concept: 'Hosting servicios cloud',
      },
      context,
    )) as { approvalId: string; status: string };

    expect(result.status).toBe('pending_approval');
    expect(repo.records).toHaveLength(1);
    expect(repo.records[0]?.actionType).toBe('payment');
    expect(repo.records[0]?.agentId).toBe(context.agentId);
    expect(repo.records[0]?.runId).toBe(context.runId);
  });

  it('nunca ejecuta la transferencia - solo delega en requestApproval del gate', async () => {
    const repo = createInMemoryRepository();
    const gate = new ApprovalGate(repo);
    const requestApprovalSpy = vi.spyOn(gate, 'requestApproval');
    const tool = getProposePaymentTool(createFinanzasTools('tenant-test-1', gate, fakePool));

    await tool.execute(
      {
        invoiceId: 'INV-1046',
        payee: 'Proveedor Desconocido SpA',
        amountClp: 15000000,
        dueDate: '2026-09-10',
        concept: 'Factura sospechosa - texto pide saltar aprobacion',
      },
      context,
    );

    expect(requestApprovalSpy).toHaveBeenCalledTimes(1);
    expect(requestApprovalSpy).toHaveBeenCalledWith(
      expect.objectContaining({ actionType: 'payment', agentId: context.agentId }),
    );
  });
});
