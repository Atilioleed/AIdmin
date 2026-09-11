'use client';

import { useState, useTransition } from 'react';
import { connectMetricoolAction, disconnectMetricoolAction } from './actions';

export function MetricoolConnect({ isConnected, connectedAt }: { isConnected: boolean; connectedAt: Date | null }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConnect(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await connectMetricoolAction(formData);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Conectar Metricool</h2>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={
            isConnected
              ? { background: 'var(--color-good-bg)', color: 'var(--color-good)' }
              : { background: 'var(--color-surface-sunken)', color: 'var(--color-ink-faint)' }
          }
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'animate-pulse-glow' : ''}`}
            style={{ background: isConnected ? 'var(--color-good)' : 'var(--color-ink-faint)' }}
          />
          {isConnected ? 'Conectado' : 'Sin conectar'}
        </span>
      </div>
      <p className="mt-2 max-w-xl text-sm text-[var(--color-ink-soft)]">
        Con tu cuenta de Metricool conectada, tu Gerente de Marketing deja de trabajar con datos de
        ejemplo y usa tu calendario y métricas reales.
      </p>

      {isConnected ? (
        <div className="mt-4 flex items-center gap-3">
          <p className="text-xs text-[var(--color-ink-faint)]">
            Conectado{connectedAt ? ` el ${new Date(connectedAt).toLocaleDateString('es-CL')}` : ''}.
          </p>
          <form action={() => startTransition(() => disconnectMetricoolAction())}>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink-soft)] hover:border-[var(--color-critical)] hover:text-[var(--color-critical)]"
            >
              Desconectar
            </button>
          </form>
        </div>
      ) : (
        <form action={handleConnect} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">API key de Metricool</label>
            <input
              name="metricoolApiKey"
              type="password"
              required
              placeholder="Pégala aquí — la sacas de tu cuenta de Metricool, Configuración → API"
              className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-violet)]/40"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-50"
            style={{ background: 'var(--gradient-brand)' }}
          >
            {isPending ? 'Conectando…' : 'Conectar'}
          </button>
          {error && <p className="w-full text-xs font-medium text-[var(--color-critical)]">{error}</p>}
        </form>
      )}
    </div>
  );
}
