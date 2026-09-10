'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AgentProfile } from '../../../../../lib/agent-profiles';
import { updateAgentProfileAction } from './actions';

const inputClass =
  'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[var(--color-violet)]/40';

export function AgentProfileForm({ profile }: { profile: AgentProfile }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [skills, setSkills] = useState<string[]>(profile.skills.length ? profile.skills : ['']);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateSkill(index: number, value: string) {
    setSkills((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function addSkill() {
    setSkills((prev) => [...prev, '']);
  }

  function removeSkill(index: number) {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateAgentProfileAction(profile.slug, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="card flex flex-col gap-6 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">Nombre</label>
          <input name="personaName" defaultValue={profile.personaName} required className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">Cargo / rol visible</label>
          <input name="displayName" defaultValue={profile.displayName} required className={inputClass} />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">
          Personalidad y tono
        </label>
        <textarea
          name="personality"
          defaultValue={profile.personality}
          required
          rows={4}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">
          Habilidades — lo que se nota en cómo trabaja
        </label>
        <div className="flex flex-col gap-2">
          {skills.map((skill, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                name="skills"
                value={skill}
                onChange={(e) => updateSkill(i, e.target.value)}
                placeholder="Ej: separa siempre lo orgánico de lo pago"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeSkill(i)}
                disabled={skills.length === 1}
                className="shrink-0 rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-xs font-semibold text-[var(--color-ink-faint)] transition-colors hover:border-[var(--color-critical)] hover:text-[var(--color-critical)] disabled:opacity-30"
                aria-label="Quitar habilidad"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addSkill}
          className="mt-2 text-xs font-semibold text-[var(--color-violet)] hover:text-[var(--color-coral)]"
        >
          + Agregar habilidad
        </button>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">Objetivo</label>
        <textarea name="objective" defaultValue={profile.objective} required rows={3} className={inputClass} />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">
          Notas adicionales <span className="font-normal text-[var(--color-ink-faint)]">(opcional)</span>
        </label>
        <textarea
          name="extraInstructions"
          defaultValue={profile.extraInstructions ?? ''}
          rows={3}
          placeholder="Cualquier instrucción extra que quieras sumar a su system prompt."
          className={inputClass}
        />
      </div>

      {error && <p className="text-xs font-medium text-[var(--color-critical)]">{error}</p>}
      {saved && !error && <p className="text-xs font-medium text-[var(--color-good)]">Guardado.</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          style={{ background: 'var(--gradient-brand)' }}
        >
          {isPending ? 'Guardando…' : 'Guardar cambios'}
        </button>
        <p className="text-xs text-[var(--color-ink-faint)]">
          Última edición: {profile.updatedAt.toLocaleString('es-CL')}
          {profile.updatedBy ? ` por ${profile.updatedBy}` : ''}
        </p>
      </div>
    </form>
  );
}
