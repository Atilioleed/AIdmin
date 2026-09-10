import { getPool } from './db';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  priceClp: number;
  stockQuantity: number;
  safetyStockThreshold: number;
  photoStoragePaths: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  price_clp: number;
  stock_quantity: number;
  safety_stock_threshold: number;
  photo_storage_paths: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceClp: row.price_clp,
    stockQuantity: row.stock_quantity,
    safetyStockThreshold: row.safety_stock_threshold,
    photoStoragePaths: row.photo_storage_paths,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listProducts(tenantId: string): Promise<Product[]> {
  const result = await getPool().query<ProductRow>(
    `SELECT id, name, description, price_clp, stock_quantity, safety_stock_threshold,
            photo_storage_paths, is_active, created_at, updated_at
     FROM products WHERE tenant_id = $1 ORDER BY created_at DESC`,
    [tenantId],
  );
  return result.rows.map(toProduct);
}

// Solo activos, para el sitio publico y para list_low_stock_products del lado agente.
export async function listActiveProducts(tenantId: string): Promise<Product[]> {
  const result = await getPool().query<ProductRow>(
    `SELECT id, name, description, price_clp, stock_quantity, safety_stock_threshold,
            photo_storage_paths, is_active, created_at, updated_at
     FROM products WHERE tenant_id = $1 AND is_active = TRUE ORDER BY created_at DESC`,
    [tenantId],
  );
  return result.rows.map(toProduct);
}

export interface ProductInput {
  name: string;
  description: string | null;
  priceClp: number;
  stockQuantity: number;
  safetyStockThreshold: number;
  photoStoragePaths: string[];
}

export async function createProduct(tenantId: string, input: ProductInput): Promise<void> {
  await getPool().query(
    `INSERT INTO products (tenant_id, name, description, price_clp, stock_quantity, safety_stock_threshold, photo_storage_paths)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      tenantId,
      input.name,
      input.description,
      input.priceClp,
      input.stockQuantity,
      input.safetyStockThreshold,
      input.photoStoragePaths,
    ],
  );
}

export async function setProductActive(tenantId: string, productId: string, isActive: boolean): Promise<void> {
  await getPool().query(
    `UPDATE products SET is_active = $3 WHERE tenant_id = $1 AND id = $2`,
    [tenantId, productId, isActive],
  );
}
