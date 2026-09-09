import { describe, expect, it, vi } from 'vitest';
import { ApprovalGate, InvalidGatedActionError } from './index.js';
import type { ApprovalRecord, ApprovalsRepository } from './types.js';
import { GATED_ACTION_TYPES } from '../agents/_shared/types.js';

// Repositorio en memoria: los tests del gate no deben depender de una Postgres real.
// La implementacion contra Postgres (pg-approvals-repository.ts) se prueba por separado.
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
    resolve(id, decision, resolvedBy, notes) {
      const record = records.find((r) => r.id === id);
      if (!record) {
        return Promise.reject(new Error(`Approval ${id} not found`));
      }
      record.status = decision;
      record.resolvedAt = new Date();
      record.resolvedBy = resolvedBy;
      record.resolutionNotes = notes ?? null;
      return Promise.resolve(record);
    },
  };
}

describe('ApprovalGate.requestApproval', () => {
  it.each(GATED_ACTION_TYPES)(
    'siempre crea el registro en estado pending_approval para action_type=%s',
    async (actionType) => {
      const repo = createInMemoryRepository();
      const gate = new ApprovalGate(repo);

      const record = await gate.requestApproval({
        agentId: 'agent-finanzas',
        actionType,
        payload: { amount: 50000, currency: 'CLP' },
      });

      expect(record.status).toBe('pending_approval');
      expect(record.resolvedAt).toBeNull();
      expect(record.resolvedBy).toBeNull();
    },
  );

  it('nunca ejecuta la accion real: solo delega en insertPending del repositorio', async () => {
    const repo = createInMemoryRepository();
    const insertSpy = vi.spyOn(repo, 'insertPending');
    const gate = new ApprovalGate(repo);

    await gate.requestApproval({
      agentId: 'agent-marketing',
      actionType: 'paid_campaign_launch',
      payload: { campaignId: 'camp-1', budgetClp: 200000 },
    });

    expect(insertSpy).toHaveBeenCalledTimes(1);
    // El gate no expone ni llama ningun metodo de "ejecucion" - solo persistencia.
    expect(gate).not.toHaveProperty('executeAction');
  });

  it('rechaza en runtime un action_type que no sea uno de los 4 tipos gateados', async () => {
    const repo = createInMemoryRepository();
    const gate = new ApprovalGate(repo);

    await expect(
      gate.requestApproval({
        agentId: 'agent-marketing',
        // Simula un valor que llega sin garantia de tipo (p.ej. desde un tool call del LLM).
        actionType: 'delete_database' as never,
        payload: {},
      }),
    ).rejects.toThrow(InvalidGatedActionError);

    expect(repo.records).toHaveLength(0);
  });

  it('conserva runId y payload arbitrario sin transformarlos', async () => {
    const repo = createInMemoryRepository();
    const gate = new ApprovalGate(repo);
    const payload = { note: 'aumento de presupuesto Q4', deltaClp: 150000 };

    const record = await gate.requestApproval({
      agentId: 'agent-marketing',
      runId: 'run-abc',
      actionType: 'budget_change',
      payload,
    });

    expect(record.runId).toBe('run-abc');
    expect(record.payload).toEqual(payload);
  });
});

describe('ApprovalGate.listPending', () => {
  it('devuelve solo los approvals en pending_approval', async () => {
    const repo = createInMemoryRepository();
    const gate = new ApprovalGate(repo);

    const pending = await gate.requestApproval({
      agentId: 'agent-finanzas',
      actionType: 'payment',
      payload: { amount: 1000 },
    });
    const other = await gate.requestApproval({
      agentId: 'agent-finanzas',
      actionType: 'payment',
      payload: { amount: 2000 },
    });
    await gate.approve(other.id, 'atilio');

    const result = await gate.listPending();

    expect(result.map((r) => r.id)).toEqual([pending.id]);
  });
});

describe('ApprovalGate.approve / reject', () => {
  it('approve() marca el registro como approved con quien aprobo', async () => {
    const repo = createInMemoryRepository();
    const gate = new ApprovalGate(repo);
    const created = await gate.requestApproval({
      agentId: 'agent-finanzas',
      actionType: 'spend',
      payload: { amount: 3000 },
    });

    const resolved = await gate.approve(created.id, 'atilio', 'ok, dentro de presupuesto');

    expect(resolved.status).toBe('approved');
    expect(resolved.resolvedBy).toBe('atilio');
    expect(resolved.resolutionNotes).toBe('ok, dentro de presupuesto');
    expect(resolved.resolvedAt).not.toBeNull();
  });

  it('reject() marca el registro como rejected', async () => {
    const repo = createInMemoryRepository();
    const gate = new ApprovalGate(repo);
    const created = await gate.requestApproval({
      agentId: 'agent-marketing',
      actionType: 'paid_campaign_launch',
      payload: { campaignId: 'camp-2' },
    });

    const resolved = await gate.reject(created.id, 'atilio', 'no por ahora');

    expect(resolved.status).toBe('rejected');
    expect(resolved.resolvedBy).toBe('atilio');
  });

  it('approve()/reject() nunca ejecutan la accion, solo cambian el estado en el repositorio', async () => {
    const repo = createInMemoryRepository();
    const resolveSpy = vi.spyOn(repo, 'resolve');
    const gate = new ApprovalGate(repo);
    const created = await gate.requestApproval({
      agentId: 'agent-finanzas',
      actionType: 'payment',
      payload: { amount: 999 },
    });

    await gate.approve(created.id, 'atilio');

    expect(resolveSpy).toHaveBeenCalledWith(created.id, 'approved', 'atilio', undefined);
  });
});
