import { getPool } from './db';

export interface ChatMessageRow {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export async function listChatMessages(tenantId: string, limit = 40): Promise<ChatMessageRow[]> {
  const result = await getPool().query<{ id: string; role: 'user' | 'assistant'; content: string; created_at: Date }>(
    `SELECT id, role, content, created_at FROM chat_messages
     WHERE tenant_id = $1 ORDER BY created_at ASC
     LIMIT $2`,
    [tenantId, limit],
  );
  return result.rows.map((r) => ({ id: r.id, role: r.role, content: r.content, createdAt: r.created_at }));
}

export async function insertChatMessage(tenantId: string, role: 'user' | 'assistant', content: string): Promise<void> {
  await getPool().query('INSERT INTO chat_messages (tenant_id, role, content) VALUES ($1, $2, $3)', [
    tenantId,
    role,
    content,
  ]);
}
