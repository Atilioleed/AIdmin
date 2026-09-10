import { getPool } from './db';
import type { AgentProfileSlug } from './agent-profiles';

export type AgentKnowledgeType = 'document' | 'link';

export interface AgentKnowledgeItem {
  id: string;
  agentSlug: AgentProfileSlug;
  type: AgentKnowledgeType;
  title: string;
  urlOrPath: string;
  description: string | null;
  createdAt: Date;
  updatedBy: string | null;
}

interface AgentKnowledgeRow {
  id: string;
  agent_slug: AgentProfileSlug;
  type: AgentKnowledgeType;
  title: string;
  url_or_path: string;
  description: string | null;
  created_at: Date;
  updated_by: string | null;
}

function toItem(row: AgentKnowledgeRow): AgentKnowledgeItem {
  return {
    id: row.id,
    agentSlug: row.agent_slug,
    type: row.type,
    title: row.title,
    urlOrPath: row.url_or_path,
    description: row.description,
    createdAt: row.created_at,
    updatedBy: row.updated_by,
  };
}

export async function listAgentKnowledge(agentSlug: AgentProfileSlug): Promise<AgentKnowledgeItem[]> {
  const result = await getPool().query<AgentKnowledgeRow>(
    `SELECT id, agent_slug, type, title, url_or_path, description, created_at, updated_by
     FROM agent_knowledge WHERE agent_slug = $1 ORDER BY created_at DESC`,
    [agentSlug],
  );
  return result.rows.map(toItem);
}

export interface AddKnowledgeDocumentInput {
  agentSlug: AgentProfileSlug;
  title: string;
  storagePath: string;
  description: string | null;
  updatedBy: string;
}

export async function addKnowledgeDocument(input: AddKnowledgeDocumentInput): Promise<void> {
  await getPool().query(
    `INSERT INTO agent_knowledge (agent_slug, type, title, url_or_path, description, updated_by)
     VALUES ($1, 'document', $2, $3, $4, $5)`,
    [input.agentSlug, input.title, input.storagePath, input.description, input.updatedBy],
  );
}

export interface AddKnowledgeLinkInput {
  agentSlug: AgentProfileSlug;
  title: string;
  url: string;
  description: string | null;
  updatedBy: string;
}

export async function addKnowledgeLink(input: AddKnowledgeLinkInput): Promise<void> {
  await getPool().query(
    `INSERT INTO agent_knowledge (agent_slug, type, title, url_or_path, description, updated_by)
     VALUES ($1, 'link', $2, $3, $4, $5)`,
    [input.agentSlug, input.title, input.url, input.description, input.updatedBy],
  );
}

export async function deleteKnowledge(id: string): Promise<void> {
  await getPool().query('DELETE FROM agent_knowledge WHERE id = $1', [id]);
}
