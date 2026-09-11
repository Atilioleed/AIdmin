'use client';

import { useState, useTransition } from 'react';
import type { BusinessContext } from '../../../../lib/business-context';
import { saveBusinessContextAction } from './actions';

const inputClass =
  'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-violet)]/40';
const labelClass = 'mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]';

const FIELDS: { name: keyof BusinessContext; label: string; placeholder: string }[] = [
  { name: 'problem', label: 'Problema que resuelve', placeholder: '¿Qué dolor real tiene tu cliente hoy?' },
  { name: 'objective', label: 'Objetivo del negocio', placeholder: '¿Qué estás tratando de lograr?' },
  { name: 'productsServices', label: 'Productos o servicios', placeholder: 'Qué vendes, en concreto.' },
  { name: 'targetMarket', label: 'Mercado objetivo', placeholder: '¿A quién le vendes? ¿Qué tamaño tiene ese mercado?' },
  { name: 'revenueModel', label: 'Modelo de ingresos', placeholder: '¿Cómo generas plata? (suscripción, por proyecto, comisión...)' },
  { name: 'innovation', label: 'Innovación / diferenciación', placeholder: '¿Qué haces distinto a todos los demás?' },
  { name: 'competitors', label: 'Competidores', placeholder: 'Quiénes hacen algo parecido, y qué te diferencia de ellos.' },
  { name: 'capitalStock', label: 'Capital / stock actual', placeholder: 'Capital disponible, inventario, activos relevantes.' },
  { name: 'scalability', label: 'Escalabilidad a otros países', placeholder: '¿Podría este negocio crecer fuera de Chile? ¿Cómo?' },
];

export function BusinessContextForm({ context }: { context: BusinessContext }) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveBusinessContextAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <form action={handleSubmit} className="card flex flex-col gap-5 p-6">
      <div>
        <label className={labelClass}>¿Qué vendes?</label>
        <select name="businessType" defaultValue={context.businessType} className={inputClass}>
          <option value="">Selecciona una opción</option>
          <option value="producto">Producto (maneja inventario/stock)</option>
          <option value="servicio">Servicio (sin inventario)</option>
          <option value="mixto">Ambos</option>
        </select>
        <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
          Si vendes producto, se habilita la sección de Inventario en tu panel.
        </p>
      </div>

      {FIELDS.map((field) => (
        <div key={field.name}>
          <label className={labelClass}>{field.label}</label>
          <textarea name={field.name} defaultValue={context[field.name] as string} placeholder={field.placeholder} rows={2} className={inputClass} />
        </div>
      ))}

      <div className="border-t border-[var(--color-border-soft)] pt-5">
        <label className={labelClass}>Alertas por correo</label>
        <input type="email" name="ownerAlertEmail" defaultValue={context.ownerAlertEmail} placeholder="tu-correo@empresa.cl" className={inputClass} />
        <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
          Cuando el CEO arma la pauta del día y queda algo pendiente de revisión (aprobaciones o
          contenido), te avisa a este correo. Déjalo vacío si no quieres recibir alertas.
        </p>
      </div>

      <div>
        <label className={labelClass}>
          WhatsApp del dueño <span className="font-normal text-[var(--color-ink-faint)]">(próximamente)</span>
        </label>
        <input type="tel" name="ownerWhatsappNumber" defaultValue={context.ownerWhatsappNumber} placeholder="+56 9 1234 5678" className={inputClass} />
        <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
          Todavía no está conectado el chat en vivo con el CEO por WhatsApp — dejamos tu número
          guardado para activarlo apenas esté listo, sin que tengas que volver a completarlo.
        </p>
      </div>

      {error && <p className="text-xs font-medium text-[var(--color-critical)]">{error}</p>}
      {saved && !error && <p className="text-xs font-medium text-[var(--color-good)]">Guardado.</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="self-start rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-50"
          style={{ background: 'var(--gradient-brand)' }}
        >
          {isPending ? 'Guardando…' : 'Guardar'}
        </button>
        {context.updatedAt && (
          <p className="text-xs text-[var(--color-ink-faint)]">
            Última edición: {new Date(context.updatedAt).toLocaleString('es-CL')}
            {context.updatedBy ? ` por ${context.updatedBy}` : ''}
          </p>
        )}
      </div>
    </form>
  );
}
