import type { ApprovalStatus, GatedActionType } from '../agents/_shared/types.js';

export interface ApprovalRequest {
  agentId: string;
  actionType: GatedActionType;
  payload: Record<string, unknown>;
  runId?: string;
}

export interface ApprovalRecord {
  id: string;
  agentId: string;
  runId: string | null;
  actionType: GatedActionType;
  payload: Record<string, unknown>;
  status: ApprovalStatus;
  requestedAt: Date;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  resolutionNotes: string | null;
}

// Puerto que el gate necesita del almacenamiento. La implementacion real vive en
// pg-approvals-repository.ts; los tests del gate usan un fake en memoria.
export interface ApprovalsRepository {
  insertPending(request: ApprovalRequest): Promise<ApprovalRecord>;
  findById(id: string): Promise<ApprovalRecord | null>;
  listByStatus(status: ApprovalStatus): Promise<ApprovalRecord[]>;
  resolve(
    id: string,
    decision: 'approved' | 'rejected',
    resolvedBy: string,
    notes?: string,
  ): Promise<ApprovalRecord>;
}
