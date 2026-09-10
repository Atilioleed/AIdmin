import type {
  ContentReviewRecord,
  ContentReviewRequest,
  ContentReviewsRepository,
} from './types.js';

/**
 * Analogo a ApprovalGate (approval-gate/index.ts) pero para contenido publico, no
 * dinero. Toda publicacion organica de un agente en redes reales pasa por aqui:
 * requestReview() SIEMPRE crea el registro en pending_review y jamas publica nada -
 * este modulo no tiene, ni siquiera tecnicamente, ninguna credencial de una red
 * social. La publicacion real ocurre en un sistema separado, solo despues de que un
 * humano aprueba por el canal humano (content-gate/server.ts).
 */
export class ContentGate {
  constructor(private readonly repo: ContentReviewsRepository) {}

  async requestReview(request: ContentReviewRequest): Promise<ContentReviewRecord> {
    return this.repo.insertPending(request);
  }

  async listPending(): Promise<ContentReviewRecord[]> {
    return this.repo.listByStatus('pending_review');
  }

  async getById(id: string): Promise<ContentReviewRecord | null> {
    return this.repo.findById(id);
  }

  async approve(id: string, resolvedBy: string, notes?: string): Promise<ContentReviewRecord> {
    return this.repo.resolve(id, 'approved', resolvedBy, notes);
  }

  async reject(id: string, resolvedBy: string, notes?: string): Promise<ContentReviewRecord> {
    return this.repo.resolve(id, 'rejected', resolvedBy, notes);
  }
}

export type {
  ContentReviewRecord,
  ContentReviewRequest,
  ContentReviewsRepository,
  ContentReviewStatus,
} from './types.js';
