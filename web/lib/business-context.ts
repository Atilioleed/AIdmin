import { getPool } from './db';

export interface BusinessContext {
  objective: string;
  problem: string;
  productsServices: string;
  targetMarket: string;
  revenueModel: string;
  capitalStock: string;
  innovation: string;
  competitors: string;
  scalability: string;
  updatedAt: Date | null;
  updatedBy: string | null;
}

interface BusinessContextRow {
  objective: string | null;
  problem: string | null;
  products_services: string | null;
  target_market: string | null;
  revenue_model: string | null;
  capital_stock: string | null;
  innovation: string | null;
  competitors: string | null;
  scalability: string | null;
  updated_at: Date;
  updated_by: string | null;
}

const EMPTY: BusinessContext = {
  objective: '',
  problem: '',
  productsServices: '',
  targetMarket: '',
  revenueModel: '',
  capitalStock: '',
  innovation: '',
  competitors: '',
  scalability: '',
  updatedAt: null,
  updatedBy: null,
};

function toBusinessContext(row: BusinessContextRow): BusinessContext {
  return {
    objective: row.objective ?? '',
    problem: row.problem ?? '',
    productsServices: row.products_services ?? '',
    targetMarket: row.target_market ?? '',
    revenueModel: row.revenue_model ?? '',
    capitalStock: row.capital_stock ?? '',
    innovation: row.innovation ?? '',
    competitors: row.competitors ?? '',
    scalability: row.scalability ?? '',
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

export async function getBusinessContext(tenantId: string): Promise<BusinessContext> {
  const result = await getPool().query<BusinessContextRow>(
    `SELECT objective, problem, products_services, target_market, revenue_model,
            capital_stock, innovation, competitors, scalability, updated_at, updated_by
     FROM business_context WHERE tenant_id = $1`,
    [tenantId],
  );
  const row = result.rows[0];
  return row ? toBusinessContext(row) : EMPTY;
}

export interface BusinessContextInput {
  objective: string;
  problem: string;
  productsServices: string;
  targetMarket: string;
  revenueModel: string;
  capitalStock: string;
  innovation: string;
  competitors: string;
  scalability: string;
  updatedBy: string;
}

export async function upsertBusinessContext(tenantId: string, input: BusinessContextInput): Promise<void> {
  await getPool().query(
    `INSERT INTO business_context
       (tenant_id, objective, problem, products_services, target_market, revenue_model,
        capital_stock, innovation, competitors, scalability, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT (tenant_id) DO UPDATE SET
       objective = EXCLUDED.objective,
       problem = EXCLUDED.problem,
       products_services = EXCLUDED.products_services,
       target_market = EXCLUDED.target_market,
       revenue_model = EXCLUDED.revenue_model,
       capital_stock = EXCLUDED.capital_stock,
       innovation = EXCLUDED.innovation,
       competitors = EXCLUDED.competitors,
       scalability = EXCLUDED.scalability,
       updated_by = EXCLUDED.updated_by`,
    [
      tenantId,
      input.objective,
      input.problem,
      input.productsServices,
      input.targetMarket,
      input.revenueModel,
      input.capitalStock,
      input.innovation,
      input.competitors,
      input.scalability,
      input.updatedBy,
    ],
  );
}
