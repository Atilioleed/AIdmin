import type { Pool } from 'pg';
import type { AgentSlug } from './types.js';

// Personalidad y habilidades de cada ROL de agente - editable desde /admin/agentes,
// global (no por tenant). Separado a proposito de los limites de autonomia: esta
// tabla nunca decide que puede o no puede HACER un agente, solo como se presenta y
// que habilidades declara. Ver db/schema.sql (tabla agent_profiles).
export interface AgentProfile {
  slug: AgentSlug;
  personaName: string;
  displayName: string;
  personality: string;
  skills: string[];
  objective: string;
  extraInstructions: string | null;
}

interface AgentProfileRow {
  slug: AgentSlug;
  persona_name: string;
  display_name: string;
  personality: string;
  skills: string[];
  objective: string;
  extra_instructions: string | null;
}

export async function loadAgentProfile(pool: Pool, slug: AgentSlug): Promise<AgentProfile> {
  const result = await pool.query<AgentProfileRow>(
    `SELECT slug, persona_name, display_name, personality, skills, objective, extra_instructions
     FROM agent_profiles WHERE slug = $1`,
    [slug],
  );
  const row = result.rows[0];
  if (!row) {
    throw new Error(
      `No existe un agent_profile para "${slug}" (corre db/seed.sql o crealo desde /admin/agentes).`,
    );
  }
  return {
    slug: row.slug,
    personaName: row.persona_name,
    displayName: row.display_name,
    personality: row.personality,
    skills: row.skills,
    objective: row.objective,
    extraInstructions: row.extra_instructions,
  };
}

// Arma la mitad EDITABLE del system prompt a partir del perfil. La mitad fija
// (limites de autonomia, contenido externo = dato, formato del reporte) sigue
// viviendo en agents/<slug>/constitution.md y se concatena aparte en Agent.run().
export function formatAgentProfileForPrompt(profile: AgentProfile): string {
  const skillsList = profile.skills.length
    ? profile.skills.map((skill) => `- ${skill}`).join('\n')
    : '- (sin habilidades declaradas todavia)';

  const extra = profile.extraInstructions?.trim()
    ? `\n\n## Notas adicionales\n\n${profile.extraInstructions.trim()}`
    : '';

  return `## Quien eres

Te llamas **${profile.personaName}**. Eres ${profile.displayName} de AIdmin.

## Personalidad y habilidades

${profile.personality}

Habilidades y rasgos:

${skillsList}

## Objetivo

${profile.objective}${extra}`;
}
