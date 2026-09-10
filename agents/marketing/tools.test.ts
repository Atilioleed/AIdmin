import { describe, expect, it } from 'vitest';
import { ApprovalGate } from '../../approval-gate/index.js';
import type { ApprovalRecord, ApprovalsRepository } from '../../approval-gate/types.js';
import { ContentGate } from '../../content-gate/index.js';
import type { ContentReviewRecord, ContentReviewsRepository } from '../../content-gate/types.js';
import type { AgentTool, AgentToolContext } from '../_shared/agent.js';
import { createMarketingTools } from './tools.js';

function createInMemoryApprovalsRepository(): ApprovalsRepository & { records: ApprovalRecord[] } {
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

function createInMemoryContentReviewsRepository(): ContentReviewsRepository & {
  records: ContentReviewRecord[];
} {
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
    resolve() {
      return Promise.reject(new Error('not used in this test'));
    },
  };
}

function getTool(tools: AgentTool[], name: string): AgentTool {
  const tool = tools.find((t) => t.name === name);
  if (!tool) throw new Error(`${name} tool not found`);
  return tool;
}

describe('Marketing propose_post tool', () => {
  it('siempre deja el post en pending_review via el content-gate real', async () => {
    const contentRepo = createInMemoryContentReviewsRepository();
    const approvalRepo = createInMemoryApprovalsRepository();
    const contentGate = new ContentGate(contentRepo);
    const approvalGate = new ApprovalGate(approvalRepo);
    const context: AgentToolContext = { agentId: 'agent-marketing-1', runId: 'run-1' };

    const tool = getTool(createMarketingTools(approvalGate, contentGate), 'propose_post');
    const result = (await tool.execute(
      { channel: 'instagram', contentText: 'Post de prueba' },
      context,
    )) as { status: string };

    expect(result.status).toBe('pending_review');
    expect(contentRepo.records).toHaveLength(1);
    expect(contentRepo.records[0]?.channel).toBe('instagram');
    expect(approvalRepo.records).toHaveLength(0);
  });
});

describe('Marketing propose_paid_campaign tool', () => {
  it('siempre deja la campaña en pending_approval via el approval-gate real', async () => {
    const contentRepo = createInMemoryContentReviewsRepository();
    const approvalRepo = createInMemoryApprovalsRepository();
    const contentGate = new ContentGate(contentRepo);
    const approvalGate = new ApprovalGate(approvalRepo);
    const context: AgentToolContext = { agentId: 'agent-marketing-1', runId: 'run-1' };

    const tool = getTool(createMarketingTools(approvalGate, contentGate), 'propose_paid_campaign');
    const result = (await tool.execute(
      {
        campaignName: 'Lanzamiento Ley 21.719',
        channel: 'instagram',
        budgetClp: 200000,
        objective: 'leads',
      },
      context,
    )) as { status: string };

    expect(result.status).toBe('pending_approval');
    expect(approvalRepo.records).toHaveLength(1);
    expect(approvalRepo.records[0]?.actionType).toBe('paid_campaign_launch');
    expect(contentRepo.records).toHaveLength(0);
  });
});

describe('Marketing propose_budget_change tool', () => {
  it('siempre deja el cambio de presupuesto en pending_approval via el approval-gate real', async () => {
    const contentRepo = createInMemoryContentReviewsRepository();
    const approvalRepo = createInMemoryApprovalsRepository();
    const contentGate = new ContentGate(contentRepo);
    const approvalGate = new ApprovalGate(approvalRepo);
    const context: AgentToolContext = { agentId: 'agent-marketing-1', runId: 'run-1' };

    const tool = getTool(createMarketingTools(approvalGate, contentGate), 'propose_budget_change');
    const result = (await tool.execute(
      {
        campaignName: 'Campaña activa',
        currentBudgetClp: 100000,
        newBudgetClp: 150000,
        reason: 'buen desempeño',
      },
      context,
    )) as { status: string };

    expect(result.status).toBe('pending_approval');
    expect(approvalRepo.records[0]?.actionType).toBe('budget_change');
  });
});
