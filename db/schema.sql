-- AIdmin - esquema base de datos (Fase 0)
-- Disenado para Postgres 18 local (Docker) hoy, Supabase en produccion.
-- gen_random_uuid() es nativo desde Postgres 15, no requiere extension.

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE, -- 'desarrollo' | 'marketing' | 'finanzas' | 'producto' | 'ceo'
  name TEXT NOT NULL,
  role_description TEXT NOT NULL,
  -- Nivel de autonomia declarado (referencia; el enforcement real vive en approval-gate,
  -- no en esta columna).
  autonomy_level TEXT NOT NULL CHECK (
    autonomy_level IN ('recommend_only', 'propose_only', 'act_low_risk', 'act_with_gate')
  ),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cada corrida de un agente agrupa uno o mas registros de decisions_log bajo el mismo run_id.
CREATE TABLE IF NOT EXISTS decisions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents (id) ON DELETE CASCADE,
  run_id UUID NOT NULL,
  decision_type TEXT NOT NULL CHECK (
    decision_type IN ('tool_call', 'reasoning_step', 'action', 'report_generated', 'error')
  ),
  tool_name TEXT, -- NULL cuando decision_type no corresponde a una llamada a tool
  input JSONB,
  output JSONB,
  reasoning TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_decisions_log_agent_id ON decisions_log (agent_id);
CREATE INDEX IF NOT EXISTS idx_decisions_log_run_id ON decisions_log (run_id);
CREATE INDEX IF NOT EXISTS idx_decisions_log_created_at ON decisions_log (created_at);

-- Toda accion de tipo payment/spend/budget_change/paid_campaign_launch pasa por aqui.
-- El approval-gate SOLO inserta filas en pending_approval; nunca ejecuta la accion real.
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents (id) ON DELETE CASCADE,
  run_id UUID,
  action_type TEXT NOT NULL CHECK (
    action_type IN ('payment', 'spend', 'budget_change', 'paid_campaign_launch')
  ),
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (
    status IN ('pending_approval', 'approved', 'rejected')
  ),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  resolution_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals (status);
CREATE INDEX IF NOT EXISTS idx_approvals_agent_id ON approvals (agent_id);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents (id) ON DELETE CASCADE,
  run_id UUID NOT NULL,
  summary TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_agent_id ON reports (agent_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports (created_at);

-- Mantiene agents.updated_at al dia sin logica extra en el codigo de la app.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_agents_updated_at ON agents;
CREATE TRIGGER trg_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
