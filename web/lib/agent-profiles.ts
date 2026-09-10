import { getPool } from './db';

// Los 6 roles de agente son fijos (ver db/schema.sql - CHECK constraint en el slug).
export const AGENT_SLUGS = ['ceo', 'marketing', 'finanzas', 'producto', 'legal', 'desarrollo'] as const;
export type AgentProfileSlug = (typeof AGENT_SLUGS)[number];

export interface AgentProfile {
  slug: AgentProfileSlug;
  personaName: string;
  displayName: string;
  personality: string;
  skills: string[];
  objective: string;
  extraInstructions: string | null;
  updatedAt: Date;
  updatedBy: string | null;
}

interface AgentProfileRow {
  slug: AgentProfileSlug;
  persona_name: string;
  display_name: string;
  personality: string;
  skills: string[];
  objective: string;
  extra_instructions: string | null;
  updated_at: Date;
  updated_by: string | null;
}

function toProfile(row: AgentProfileRow): AgentProfile {
  return {
    slug: row.slug,
    personaName: row.persona_name,
    displayName: row.display_name,
    personality: row.personality,
    skills: row.skills,
    objective: row.objective,
    extraInstructions: row.extra_instructions,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

export async function listAgentProfiles(): Promise<AgentProfile[]> {
  const result = await getPool().query<AgentProfileRow>(
    `SELECT slug, persona_name, display_name, personality, skills, objective, extra_instructions, updated_at, updated_by
     FROM agent_profiles ORDER BY slug`,
  );
  return result.rows.map(toProfile);
}

export async function getAgentProfile(slug: AgentProfileSlug): Promise<AgentProfile | null> {
  const result = await getPool().query<AgentProfileRow>(
    `SELECT slug, persona_name, display_name, personality, skills, objective, extra_instructions, updated_at, updated_by
     FROM agent_profiles WHERE slug = $1`,
    [slug],
  );
  const row = result.rows[0];
  return row ? toProfile(row) : null;
}

export interface AgentProfileUpdate {
  personaName: string;
  displayName: string;
  personality: string;
  skills: string[];
  objective: string;
  extraInstructions: string | null;
  updatedBy: string;
}

export async function updateAgentProfile(slug: AgentProfileSlug, input: AgentProfileUpdate): Promise<void> {
  await getPool().query(
    `UPDATE agent_profiles
     SET persona_name = $2, display_name = $3, personality = $4, skills = $5,
         objective = $6, extra_instructions = $7, updated_by = $8
     WHERE slug = $1`,
    [
      slug,
      input.personaName,
      input.displayName,
      input.personality,
      input.skills,
      input.objective,
      input.extraInstructions,
      input.updatedBy,
    ],
  );
}
