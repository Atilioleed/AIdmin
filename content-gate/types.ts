export type ContentReviewStatus = 'pending_review' | 'approved' | 'rejected';

export interface ContentReviewRequest {
  agentId: string;
  channel: string;
  contentText: string;
  scheduledFor?: Date;
  runId?: string;
}

export interface ContentReviewRecord {
  id: string;
  agentId: string;
  runId: string | null;
  channel: string;
  contentText: string;
  scheduledFor: Date | null;
  status: ContentReviewStatus;
  requestedAt: Date;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  resolutionNotes: string | null;
}

// Puerto que el gate necesita del almacenamiento. La implementacion real vive en
// pg-content-reviews-repository.ts; los tests del gate usan un fake en memoria.
export interface ContentReviewsRepository {
  insertPending(request: ContentReviewRequest): Promise<ContentReviewRecord>;
  findById(id: string): Promise<ContentReviewRecord | null>;
  listByStatus(status: ContentReviewStatus): Promise<ContentReviewRecord[]>;
  resolve(
    id: string,
    decision: 'approved' | 'rejected',
    resolvedBy: string,
    notes?: string,
  ): Promise<ContentReviewRecord>;
}
