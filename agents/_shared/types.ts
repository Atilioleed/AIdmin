// Tipos compartidos por todos los agentes y por approval-gate.

export type AgentSlug = 'ceo' | 'marketing' | 'finanzas' | 'producto' | 'desarrollo' | 'legal';

export type AutonomyLevel = 'recommend_only' | 'propose_only' | 'act_low_risk' | 'act_with_gate';

// Estas 4 son las UNICAS acciones que deben pasar por el approval-gate (regla no negociable,
// seccion 4 del prompt de arquitectura). Cualquier otra accion no es competencia del gate.
export type GatedActionType = 'payment' | 'spend' | 'budget_change' | 'paid_campaign_launch';

export const GATED_ACTION_TYPES: readonly GatedActionType[] = [
  'payment',
  'spend',
  'budget_change',
  'paid_campaign_launch',
];

export type ApprovalStatus = 'pending_approval' | 'approved' | 'rejected';

export type DecisionType = 'tool_call' | 'reasoning_step' | 'action' | 'report_generated' | 'error';
