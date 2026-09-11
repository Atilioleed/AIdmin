import { getPool } from './db';
import { AGENT_SLUGS, type AgentProfileSlug } from './agent-profiles';

export interface AgentUsageSummary {
  agentSlug: AgentProfileSlug;
  capTokens: number;
  todayTokens: number;
  todayRuns: number;
  todayCappedRuns: number;
  last7DaysTokens: number;
  last7DaysRuns: number;
}

interface UsageRow {
  agent_slug: string;
  input_tokens: string;
  output_tokens: string;
  run_count: number;
  capped_run_count: number;
}

export async function getTenantDailyCap(tenantId: string): Promise<number> {
  const result = await getPool().query<{ daily_token_cap_per_agent: number }>(
    'SELECT daily_token_cap_per_agent FROM tenants WHERE id = $1',
    [tenantId],
  );
  return result.rows[0]?.daily_token_cap_per_agent ?? 200000;
}

export async function updateTenantDailyCap(tenantId: string, capTokens: number): Promise<void> {
  await getPool().query('UPDATE tenants SET daily_token_cap_per_agent = $2 WHERE id = $1', [tenantId, capTokens]);
}

/**
 * Mismo chequeo que agents/_shared/usage.ts (checkDailyCapOk), pero para el chat en
 * vivo del panel cliente, que corre en web/ - paquete separado, misma tabla. El chat
 * con el CEO cuenta contra el tope diario del propio agente 'ceo'.
 */
export async function checkCeoChatCapOk(tenantId: string): Promise<{ ok: boolean; capTokens: number; usedTokens: number }> {
  const capTokens = await getTenantDailyCap(tenantId);
  const result = await getPool().query<{ input_tokens: string; output_tokens: string }>(
    `SELECT input_tokens, output_tokens FROM agent_usage_daily
     WHERE tenant_id = $1 AND agent_slug = 'ceo' AND usage_date = CURRENT_DATE`,
    [tenantId],
  );
  const row = result.rows[0];
  const usedTokens = row ? Number(row.input_tokens) + Number(row.output_tokens) : 0;
  return { ok: usedTokens < capTokens, capTokens, usedTokens };
}

export async function recordCeoChatUsage(tenantId: string, inputTokens: number, outputTokens: number): Promise<void> {
  await getPool().query(
    `INSERT INTO agent_usage_daily (tenant_id, agent_slug, usage_date, input_tokens, output_tokens, run_count)
     VALUES ($1, 'ceo', CURRENT_DATE, $2, $3, 1)
     ON CONFLICT (tenant_id, agent_slug, usage_date) DO UPDATE SET
       input_tokens = agent_usage_daily.input_tokens + EXCLUDED.input_tokens,
       output_tokens = agent_usage_daily.output_tokens + EXCLUDED.output_tokens,
       run_count = agent_usage_daily.run_count + EXCLUDED.run_count`,
    [tenantId, inputTokens, outputTokens],
  );
}

/** Uso de HOY + acumulado de los ultimos 7 dias, por cada uno de los 6 agentes. */
export async function getTenantUsageSummary(tenantId: string): Promise<AgentUsageSummary[]> {
  const capTokens = await getTenantDailyCap(tenantId);
  const pool = getPool();

  const [todayResult, weekResult] = await Promise.all([
    pool.query<UsageRow>(
      `SELECT agent_slug, input_tokens, output_tokens, run_count, capped_run_count
       FROM agent_usage_daily WHERE tenant_id = $1 AND usage_date = CURRENT_DATE`,
      [tenantId],
    ),
    pool.query<{ agent_slug: string; input_tokens: string; output_tokens: string; run_count: string }>(
      `SELECT agent_slug, SUM(input_tokens) AS input_tokens, SUM(output_tokens) AS output_tokens, SUM(run_count) AS run_count
       FROM agent_usage_daily
       WHERE tenant_id = $1 AND usage_date >= CURRENT_DATE - INTERVAL '6 days'
       GROUP BY agent_slug`,
      [tenantId],
    ),
  ]);

  const todayBySlug = new Map(todayResult.rows.map((r) => [r.agent_slug, r]));
  const weekBySlug = new Map(weekResult.rows.map((r) => [r.agent_slug, r]));

  return AGENT_SLUGS.map((slug) => {
    const today = todayBySlug.get(slug);
    const week = weekBySlug.get(slug);
    return {
      agentSlug: slug,
      capTokens,
      todayTokens: today ? Number(today.input_tokens) + Number(today.output_tokens) : 0,
      todayRuns: today?.run_count ?? 0,
      todayCappedRuns: today?.capped_run_count ?? 0,
      last7DaysTokens: week ? Number(week.input_tokens) + Number(week.output_tokens) : 0,
      last7DaysRuns: week ? Number(week.run_count) : 0,
    };
  });
}
