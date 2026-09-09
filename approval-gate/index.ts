import { GATED_ACTION_TYPES, type GatedActionType } from '../agents/_shared/types.js';
import type { ApprovalRecord, ApprovalRequest, ApprovalsRepository } from './types.js';

export class InvalidGatedActionError extends Error {
  constructor(actionType: string) {
    super(
      `"${actionType}" no es un action_type valido para el approval-gate. ` +
        `Valores permitidos: ${GATED_ACTION_TYPES.join(', ')}.`,
    );
    this.name = 'InvalidGatedActionError';
  }
}

function isGatedActionType(value: string): value is GatedActionType {
  return (GATED_ACTION_TYPES as readonly string[]).includes(value);
}

/**
 * Unico punto de paso para toda accion de tipo payment/spend/budget_change/
 * paid_campaign_launch, sin importar que agente la origine (incluido el CEO).
 *
 * Esta clase NO tiene ningun metodo que ejecute la accion real, ni credenciales para
 * hacerlo. Su unico trabajo es dejar la solicitud en pending_approval y, mas tarde,
 * registrar la decision humana. La ejecucion post-aprobacion vive en un sistema
 * separado que si tiene esas credenciales - este gate nunca las tiene.
 */
export class ApprovalGate {
  constructor(private readonly repo: ApprovalsRepository) {}

  async requestApproval(request: ApprovalRequest): Promise<ApprovalRecord> {
    if (!isGatedActionType(request.actionType)) {
      throw new InvalidGatedActionError(request.actionType);
    }
    return this.repo.insertPending(request);
  }

  async listPending(): Promise<ApprovalRecord[]> {
    return this.repo.listByStatus('pending_approval');
  }

  async getById(id: string): Promise<ApprovalRecord | null> {
    return this.repo.findById(id);
  }

  async approve(id: string, resolvedBy: string, notes?: string): Promise<ApprovalRecord> {
    return this.repo.resolve(id, 'approved', resolvedBy, notes);
  }

  async reject(id: string, resolvedBy: string, notes?: string): Promise<ApprovalRecord> {
    return this.repo.resolve(id, 'rejected', resolvedBy, notes);
  }
}

export type { ApprovalRecord, ApprovalRequest, ApprovalsRepository } from './types.js';
