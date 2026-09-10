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
