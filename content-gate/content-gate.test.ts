import { describe, expect, it, vi } from 'vitest';
import { ContentGate } from './index.js';
import type { ContentReviewRecord, ContentReviewsRepository } from './types.js';

// Mismo patron que approval-gate.test.ts: repositorio en memoria, sin Postgres real.
function createInMemoryRepository(): ContentReviewsRepository & { records: ContentReviewRecord[] } {
  const records: ContentReviewRecord[] = [];
  let seq = 0;

  return {
    records,
    insertPending(request) {
      const record: ContentReviewRecord = {
        id: `test-review-${(seq += 1)}`,
        agentId: request.agentId,
        runId: request.runId ?? null,
        channel: request.channel,
        contentText: request.contentText,
        scheduledFor: request.scheduledFor ?? null,
        status: 'pending_review',
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
        return Promise.reject(new Error(`Content review ${id} not found`));
      }
      record.status = decision;
      record.resolvedAt = new Date();
      record.resolvedBy = resolvedBy;
      record.resolutionNotes = notes ?? null;
      return Promise.resolve(record);
    },
  };
}

describe('ContentGate.requestReview', () => {
  it('siempre crea el registro en pending_review, sin importar el canal', async () => {
    const repo = createInMemoryRepository();
    const gate = new ContentGate(repo);

    const record = await gate.requestReview({
      agentId: 'agent-marketing',
      channel: 'instagram',
      contentText: 'Genera tu contrato de arriendo en minutos con FIRMA IA.',
    });

    expect(record.status).toBe('pending_review');
    expect(record.resolvedAt).toBeNull();
    expect(record.resolvedBy).toBeNull();
  });

  it('nunca publica nada - solo delega en insertPending del repositorio', async () => {
    const repo = createInMemoryRepository();
    const insertSpy = vi.spyOn(repo, 'insertPending');
    const gate = new ContentGate(repo);

    await gate.requestReview({
      agentId: 'agent-marketing',
      channel: 'tiktok',
      contentText: 'Nuevo video explicando finiquitos laborales.',
    });

    expect(insertSpy).toHaveBeenCalledTimes(1);
    expect(gate).not.toHaveProperty('publish');
  });

  it('conserva runId, canal y scheduledFor sin transformarlos', async () => {
    const repo = createInMemoryRepository();
    const gate = new ContentGate(repo);
    const scheduledFor = new Date('2026-09-15T12:00:00Z');

    const record = await gate.requestReview({
      agentId: 'agent-marketing',
      runId: 'run-abc',
      channel: 'linkedin',
      contentText: 'Post sobre proteccion de datos (Ley 21.719).',
      scheduledFor,
    });

    expect(record.runId).toBe('run-abc');
    expect(record.channel).toBe('linkedin');
    expect(record.scheduledFor).toEqual(scheduledFor);
  });
});

describe('ContentGate.listPending', () => {
  it('devuelve solo los reviews en pending_review', async () => {
    const repo = createInMemoryRepository();
    const gate = new ContentGate(repo);

    const pending = await gate.requestReview({
      agentId: 'agent-marketing',
      channel: 'instagram',
      contentText: 'Post 1',
    });
    const other = await gate.requestReview({
      agentId: 'agent-marketing',
      channel: 'instagram',
      contentText: 'Post 2',
    });
    await gate.approve(other.id, 'atilio');

    const result = await gate.listPending();

    expect(result.map((r) => r.id)).toEqual([pending.id]);
  });
});

describe('ContentGate.approve / reject', () => {
  it('approve() marca el registro como approved con quien aprobo', async () => {
    const repo = createInMemoryRepository();
    const gate = new ContentGate(repo);
    const created = await gate.requestReview({
      agentId: 'agent-marketing',
      channel: 'facebook',
      contentText: 'Post de prueba',
    });

    const resolved = await gate.approve(created.id, 'atilio', 'ok, publicar');

    expect(resolved.status).toBe('approved');
    expect(resolved.resolvedBy).toBe('atilio');
    expect(resolved.resolutionNotes).toBe('ok, publicar');
  });

  it('reject() marca el registro como rejected', async () => {
    const repo = createInMemoryRepository();
    const gate = new ContentGate(repo);
    const created = await gate.requestReview({
      agentId: 'agent-marketing',
      channel: 'x',
      contentText: 'Post de prueba 2',
    });

    const resolved = await gate.reject(created.id, 'atilio', 'tono no calza con la marca');

    expect(resolved.status).toBe('rejected');
    expect(resolved.resolvedBy).toBe('atilio');
  });
});
