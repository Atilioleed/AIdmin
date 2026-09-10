'use client';

import { useState, useTransition } from 'react';
import type { BusinessContext } from '../../../../lib/business-context';
import { saveBusinessContextAction } from './actions';

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
    <form action={handleSubmit} className="flex flex-col gap-5 rounded-lg border border-neutral-200 bg-white p-5">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">¿Qué vendes?</label>
        <select
          name="businessType"
          defaultValue={context.businessType}
          className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
        >
          <option value="">Selecciona una opción</option>
          <option value="producto">Producto (maneja inventario/stock)</option>
          <option value="servicio">Servicio (sin inventario)</option>
          <option value="mixto">Ambos</option>
        </select>
        <p className="mt-1 text-xs text-neutral-400">
          Si vendes producto, se habilita la sección de Inventario en tu panel.
        </p>
      </div>

      {FIELDS.map((field) => (
        <div key={field.name}>
          <label className="mb-1 block text-xs font-medium text-neutral-600">{field.label}</label>
          <textarea
            name={field.name}
            defaultValue={context[field.name] as string}
            placeholder={field.placeholder}
            rows={2}
            className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </div>
      ))}

      <div className="border-t border-neutral-200 pt-5">
        <label className="mb-1 block text-xs font-medium text-neutral-600">Alertas por correo</label>
        <input
          type="email"
          name="ownerAlertEmail"
          defaultValue={context.ownerAlertEmail}
          placeholder="tu-correo@empresa.cl"
          className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
        />
        <p className="mt-1 text-xs text-neutral-400">
          Cuando el CEO arma la pauta del día y queda algo pendiente de revisión (aprobaciones o
          contenido), te avisa a este correo. Déjalo vacío si no quieres recibir alertas.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">
          WhatsApp del dueño <span className="text-neutral-400">(próximamente)</span>
        </label>
        <input
          type="tel"
          name="ownerWhatsappNumber"
          defaultValue={context.ownerWhatsappNumber}
          placeholder="+56 9 1234 5678"
          className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
        />
        <p className="mt-1 text-xs text-neutral-400">
          Todavía no está conectado el chat en vivo con el CEO por WhatsApp — dejamos tu número
          guardado para activarlo apenas esté listo, sin que tengas que volver a completarlo.
        </p>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {saved && !error && <p className="text-xs text-emerald-600">Guardado.</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="self-start rounded bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {isPending ? 'Guardando…' : 'Guardar'}
        </button>
        {context.updatedAt && (
          <p className="text-xs text-neutral-400">
            Última edición: {new Date(context.updatedAt).toLocaleString('es-CL')}
            {context.updatedBy ? ` por ${context.updatedBy}` : ''}
          </p>
        )}
      </div>
    </form>
  );
}
