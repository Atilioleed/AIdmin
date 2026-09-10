import { getPool } from './db';

export type BusinessType = 'producto' | 'servicio' | 'mixto' | '';

export interface BusinessContext {
  businessType: BusinessType;
  objective: string;
  problem: string;
  productsServices: string;
  targetMarket: string;
  revenueModel: string;
  capitalStock: string;
  innovation: string;
  competitors: string;
  scalability: string;
  ownerAlertEmail: string;
  updatedAt: Date | null;
  updatedBy: string | null;
}

interface BusinessContextRow {
  business_type: BusinessType | null;
  objective: string | null;
  problem: string | null;
  products_services: string | null;
  target_market: string | null;
  revenue_model: string | null;
  capital_stock: string | null;
  innovation: string | null;
  competitors: string | null;
  scalability: string | null;
  owner_alert_email: string | null;
  updated_at: Date;
  updated_by: string | null;
}

const EMPTY: BusinessContext = {
  businessType: '',
  objective: '',
  problem: '',
  productsServices: '',
  targetMarket: '',
  revenueModel: '',
  capitalStock: '',
  innovation: '',
  competitors: '',
  scalability: '',
  ownerAlertEmail: '',
  updatedAt: null,
  updatedBy: null,
};

function toBusinessContext(row: BusinessContextRow): BusinessContext {
  return {
    businessType: row.business_type ?? '',
    objective: row.objective ?? '',
    problem: row.problem ?? '',
    productsServices: row.products_services ?? '',
    targetMarket: row.target_market ?? '',
    revenueModel: row.revenue_model ?? '',
    capitalStock: row.capital_stock ?? '',
    innovation: row.innovation ?? '',
    competitors: row.competitors ?? '',
    scalability: row.scalability ?? '',
    ownerAlertEmail: row.owner_alert_email ?? '',
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

export async function getBusinessContext(tenantId: string): Promise<BusinessContext> {
  const result = await getPool().query<BusinessContextRow>(
    `SELECT business_type, objective, problem, products_services, target_market, revenue_model,
            capital_stock, innovation, competitors, scalability, owner_alert_email, updated_at, updated_by
     FROM business_context WHERE tenant_id = $1`,
    [tenantId],
  );
  const row = result.rows[0];
  return row ? toBusinessContext(row) : EMPTY;
}

export interface BusinessContextInput {
  businessType: BusinessType;
  objective: string;
  problem: string;
  productsServices: string;
  targetMarket: string;
  revenueModel: string;
  capitalStock: string;
  innovation: string;
  competitors: string;
  scalability: string;
  ownerAlertEmail: string;
  updatedBy: string;
}

export async function upsertBusinessContext(tenantId: string, input: BusinessContextInput): Promise<void> {
  await getPool().query(
    `INSERT INTO business_context
       (tenant_id, business_type, objective, problem, products_services, target_market, revenue_model,
        capital_stock, innovation, competitors, scalability, owner_alert_email, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     ON CONFLICT (tenant_id) DO UPDATE SET
       business_type = EXCLUDED.business_type,
       objective = EXCLUDED.objective,
       problem = EXCLUDED.problem,
       products_services = EXCLUDED.products_services,
       target_market = EXCLUDED.target_market,
       revenue_model = EXCLUDED.revenue_model,
       capital_stock = EXCLUDED.capital_stock,
       innovation = EXCLUDED.innovation,
       competitors = EXCLUDED.competitors,
       scalability = EXCLUDED.scalability,
       owner_alert_email = EXCLUDED.owner_alert_email,
       updated_by = EXCLUDED.updated_by`,
    [
      tenantId,
      input.businessType || null,
      input.objective,
      input.problem,
      input.productsServices,
      input.targetMarket,
      input.revenueModel,
      input.capitalStock,
      input.innovation,
      input.competitors,
      input.scalability,
      input.ownerAlertEmail || null,
      input.updatedBy,
    ],
  );
}
