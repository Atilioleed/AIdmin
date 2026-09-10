import type { Pool } from 'pg';
import type { AgentSlug } from './types.js';

export interface CapCheckResult {
  ok: boolean;
  capTokens: number;
  usedTokens: number;
}

/**
 * Se corre ANTES de llamar al modelo (Agent.run() en agent.ts). Protege el costo
 * real de AIdmin: si este tenant+agente ya gasto su presupuesto de tokens de HOY,
 * la corrida no llama al LLM en absoluto - no es "el agente respondio corto", es
 * "no se lo llamo". El tope es por tenant (tenants.daily_token_cap_per_agent), no
 * un limite global, para poder variarlo por plan.
 */
export async function checkDailyCapOk(
  pool: Pool,
  tenantId: string,
  agentSlug: AgentSlug,
): Promise<CapCheckResult> {
  const capResult = await pool.query<{ daily_token_cap_per_agent: number }>(
    'SELECT daily_token_cap_per_agent FROM tenants WHERE id = $1',
    [tenantId],
  );
  const capTokens = capResult.rows[0]?.daily_token_cap_per_agent ?? 200000;

  const usageResult = await pool.query<{ input_tokens: string; output_tokens: string }>(
    `SELECT input_tokens, output_tokens FROM agent_usage_daily
     WHERE tenant_id = $1 AND agent_slug = $2 AND usage_date = CURRENT_DATE`,
    [tenantId, agentSlug],
  );
  const row = usageResult.rows[0];
  const usedTokens = row ? Number(row.input_tokens) + Number(row.output_tokens) : 0;

  return { ok: usedTokens < capTokens, capTokens, usedTokens };
}

/**
 * Suma el uso de una corrida al acumulado de HOY para este tenant+agente. Se llama
 * una vez al final de Agent.run(), con la suma de todas las llamadas al modelo que
 * hizo esa corrida (puede ser mas de una si hubo tool calls). capped=true cuando la
 * corrida ni siquiera llamo al modelo por haber topado el limite - se cuenta aparte
 * para que el panel admin distinga "trabajo normal" de "corridas bloqueadas".
 */
export async function recordUsage(
  pool: Pool,
  tenantId: string,
  agentSlug: AgentSlug,
  inputTokens: number,
  outputTokens: number,
  capped: boolean,
): Promise<void> {
  await pool.query(
    `INSERT INTO agent_usage_daily (tenant_id, agent_slug, usage_date, input_tokens, output_tokens, run_count, capped_run_count)
     VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6)
     ON CONFLICT (tenant_id, agent_slug, usage_date) DO UPDATE SET
       input_tokens = agent_usage_daily.input_tokens + EXCLUDED.input_tokens,
       output_tokens = agent_usage_daily.output_tokens + EXCLUDED.output_tokens,
       run_count = agent_usage_daily.run_count + EXCLUDED.run_count,
       capped_run_count = agent_usage_daily.capped_run_count + EXCLUDED.capped_run_count`,
    [tenantId, agentSlug, inputTokens, outputTokens, capped ? 0 : 1, capped ? 1 : 0],
  );
}
