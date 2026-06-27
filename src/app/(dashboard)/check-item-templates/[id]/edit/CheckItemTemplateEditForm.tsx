"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CheckItemTemplate, ModuleType, CriticalityLevel } from "@/types";
import { generateId } from "@/lib/utils";

interface Props {
  initial?: CheckItemTemplate;
  moduleTypes: ModuleType[];
  criticalityLevels: CriticalityLevel[];
}

export default function CheckItemTemplateEditForm({ initial, moduleTypes, criticalityLevels }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    module_type_id: initial?.module_type_id ?? moduleTypes[0]?.id ?? "",
    category: initial?.category ?? "",
    description: initial?.description ?? "",
    criticality_id: initial?.criticality_id ?? criticalityLevels[0]?.id ?? "",
    order_index: initial?.order_index ?? 0,
    is_active: initial?.is_active ?? true,
  });

  function set(field: string, value: unknown) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const now = Date.now();
    const payload = {
      id: initial?.id ?? generateId(),
      module_type_id: form.module_type_id,
      category: form.category.trim(),
      description: form.description.trim(),
      criticality_id: form.criticality_id,
      order_index: Number(form.order_index),
      is_active: form.is_active,
      created_at: initial?.created_at ?? now,
      updated_at: now,
    };

    try {
      const res = initial
        ? await fetch(`/api/check-item-templates/${initial.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/check-item-templates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Errore ${res.status}: ${text}`);
      }
      router.push("/check-item-templates");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore salvataggio");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-card">
      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="form-group">
        <label className="form-label">Tipo modulo *</label>
        <select className="form-input" value={form.module_type_id}
          onChange={e => set("module_type_id", e.target.value)} required>
          {moduleTypes.map(m => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Categoria</label>
        <input className="form-input" value={form.category} onChange={e => set("category", e.target.value)}
          placeholder="es. Lubrificazione" />
      </div>

      <div className="form-group">
        <label className="form-label">Descrizione voce *</label>
        <textarea className="form-input" rows={3} value={form.description}
          onChange={e => set("description", e.target.value)}
          placeholder="es. Verificare il livello dell'olio riduttore" required />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Criticità *</label>
          <select className="form-input" value={form.criticality_id}
            onChange={e => set("criticality_id", e.target.value)} required>
            {criticalityLevels.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Ordine</label>
          <input className="form-input" type="number" min={0} value={form.order_index}
            onChange={e => set("order_index", e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} />
          Attivo
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Annulla</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Salvataggio…" : "Salva"}
        </button>
      </div>
    </form>
  );
}
