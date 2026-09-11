'use client';

import { useState, useTransition } from 'react';
import type { OrderStatus } from '../../../../lib/orders';
import { updateOrderStatusAction } from './actions';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'recibido', label: 'Recibido' },
  { value: 'preparando', label: 'Preparando' },
  { value: 'despachado', label: 'Despachado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
];

const STATUS_COLOR: Record<OrderStatus, { bg: string; fg: string }> = {
  recibido: { bg: 'var(--color-surface-sunken)', fg: 'var(--color-ink-soft)' },
  preparando: { bg: 'var(--color-warn-bg)', fg: 'var(--color-warn)' },
  despachado: { bg: 'var(--color-good-bg)', fg: 'var(--color-good)' },
  entregado: { bg: 'var(--color-good-bg)', fg: 'var(--color-good)' },
  cancelado: { bg: 'var(--color-critical-bg)', fg: 'var(--color-critical)' },
};

export function OrderStatusControl({
  orderId,
  status,
  trackingInfo,
  hasEmail,
}: {
  orderId: string;
  status: OrderStatus;
  trackingInfo: string | null;
  hasEmail: boolean;
}) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [tracking, setTracking] = useState(trackingInfo ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleUpdate(newStatus: OrderStatus) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, newStatus, tracking);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setCurrentStatus(newStatus);
      if (hasEmail) {
        setMessage(result.emailSent ? 'Cliente avisado por correo.' : `Sin correo: ${result.emailReason ?? 'no se pudo enviar.'}`);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={currentStatus}
          onChange={(e) => handleUpdate(e.target.value as OrderStatus)}
          disabled={isPending}
          className="rounded-full px-3 py-1 text-xs font-semibold outline-none"
          style={{ background: STATUS_COLOR[currentStatus].bg, color: STATUS_COLOR[currentStatus].fg }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <input
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          onBlur={() => handleUpdate(currentStatus)}
          placeholder="Courier + N° de seguimiento"
          className="w-44 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-2 py-1 text-xs text-[var(--color-ink)] outline-none"
        />
      </div>
      {message && <p className="text-[11px] text-[var(--color-ink-faint)]">{message}</p>}
    </div>
  );
}
