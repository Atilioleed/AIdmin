import { getPool } from './db';
import { sendEmail } from './resend';

export type OrderStatus = 'recibido' | 'preparando' | 'despachado' | 'entregado' | 'cancelado';

export interface OrderItem {
  productId: string | null;
  name: string;
  quantity: number;
  unitPriceClp: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  shippingAddress: string | null;
  items: OrderItem[];
  totalClp: number;
  status: OrderStatus;
  trackingInfo: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
}

interface OrderRow {
  id: string;
  order_number: number;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: string | null;
  items: OrderItem[];
  total_clp: number;
  status: OrderStatus;
  tracking_info: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  created_by: string | null;
}

const COLUMNS =
  'id, order_number, customer_name, customer_email, customer_phone, shipping_address, ' +
  'items, total_clp, status, tracking_info, notes, created_at, updated_at, created_by';

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    shippingAddress: row.shipping_address,
    items: row.items,
    totalClp: row.total_clp,
    status: row.status,
    trackingInfo: row.tracking_info,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
  };
}

export async function listOrders(tenantId: string): Promise<Order[]> {
  const result = await getPool().query<OrderRow>(
    `SELECT ${COLUMNS} FROM orders WHERE tenant_id = $1 ORDER BY order_number DESC`,
    [tenantId],
  );
  return result.rows.map(toOrder);
}

export async function getOrderById(tenantId: string, orderId: string): Promise<Order | null> {
  const result = await getPool().query<OrderRow>(`SELECT ${COLUMNS} FROM orders WHERE tenant_id = $1 AND id = $2`, [
    tenantId,
    orderId,
  ]);
  const row = result.rows[0];
  return row ? toOrder(row) : null;
}

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  shippingAddress: string | null;
  items: OrderItem[];
  notes: string | null;
  createdBy: string;
}

/**
 * order_number correlativo POR TENANT (no global) - el INSERT...SELECT calcula el
 * siguiente numero en la misma sentencia, sin ventana de carrera entre leer el
 * maximo actual e insertar (no hay SELECT + INSERT como dos pasos separados).
 */
export async function createOrder(tenantId: string, input: CreateOrderInput): Promise<Order> {
  const totalClp = input.items.reduce((sum, item) => sum + item.quantity * item.unitPriceClp, 0);

  const result = await getPool().query<OrderRow>(
    `INSERT INTO orders (tenant_id, order_number, customer_name, customer_email, customer_phone,
                          shipping_address, items, total_clp, notes, created_by)
     SELECT $1, COALESCE(MAX(order_number), 1000) + 1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9
     FROM orders WHERE tenant_id = $1
     RETURNING ${COLUMNS}`,
    [
      tenantId,
      input.customerName,
      input.customerEmail,
      input.customerPhone,
      input.shippingAddress,
      JSON.stringify(input.items),
      totalClp,
      input.notes,
      input.createdBy,
    ],
  );
  return toOrder(result.rows[0]);
}

const STATUS_EMAIL_SUBJECT: Record<OrderStatus, (orderNumber: number) => string> = {
  recibido: (n) => `Recibimos tu pedido #${n}`,
  preparando: (n) => `Estamos preparando tu pedido #${n}`,
  despachado: (n) => `Tu pedido #${n} fue despachado`,
  entregado: (n) => `Tu pedido #${n} fue entregado`,
  cancelado: (n) => `Tu pedido #${n} fue cancelado`,
};

function buildStatusEmailBody(businessName: string, order: Order): string {
  const itemsList = order.items.map((i) => `- ${i.quantity} x ${i.name}`).join('\n');
  const lines = [
    `Hola ${order.customerName},`,
    '',
    `Tu pedido #${order.orderNumber} con ${businessName} cambió de estado: ${order.status}.`,
    '',
    itemsList,
    '',
    `Total: ${order.totalClp.toLocaleString('es-CL')} CLP`,
  ];
  if (order.status === 'despachado' && order.trackingInfo) {
    lines.push('', `Seguimiento: ${order.trackingInfo}`);
  }
  if (order.shippingAddress) {
    lines.push('', `Dirección de entrega: ${order.shippingAddress}`);
  }
  return lines.join('\n');
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  trackingInfo: string | null;
}

/** Actualiza el estado y, si el pedido tiene correo, le avisa al cliente final automáticamente. */
export async function updateOrderStatus(
  tenantId: string,
  orderId: string,
  businessName: string,
  input: UpdateOrderStatusInput,
): Promise<{ order: Order; emailSent: boolean; emailReason?: string }> {
  const result = await getPool().query<OrderRow>(
    `UPDATE orders SET status = $3, tracking_info = $4 WHERE tenant_id = $1 AND id = $2 RETURNING ${COLUMNS}`,
    [tenantId, orderId, input.status, input.trackingInfo],
  );
  const order = toOrder(result.rows[0]);

  if (!order.customerEmail) {
    return { order, emailSent: false, emailReason: 'El pedido no tiene correo del cliente final.' };
  }

  const subject = STATUS_EMAIL_SUBJECT[order.status](order.orderNumber);
  const body = buildStatusEmailBody(businessName, order);
  const emailResult = await sendEmail(order.customerEmail, subject, body);

  return { order, emailSent: emailResult.sent, emailReason: emailResult.reason };
}
