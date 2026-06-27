"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ModuleType } from "@/types";
import { generateId } from "@/lib/utils";

export default function ModuleTypeEditForm({ initial }: { initial?: ModuleType }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: initial?.code ?? "",
    label: initial?.label ?? "",
    description: initial?.description ?? "",
    icon_name: initial?.icon_name ?? "",
    sort_order: initial?.sort_order ?? 0,
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
      code: form.code.trim().toUpperCase(),
      label: form.label.trim(),
      description: form.description.trim() || null,
      icon_name: form.icon_name.trim() || null,
      sort_order: Number(form.sort_order),
      is_active: form.is_active,
      created_at: initial?.created_at ?? now,
      updated_at: now,
    };

    try {
      const res = initial
        ? await fetch(`/api/module-types/${initial.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/module-types", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Errore ${res.status}: ${text}`);
      }
      router.push("/module-types");
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
        <label className="form-label">Codice *</label>
        <input className="form-input" value={form.code} onChange={e => set("code", e.target.value)}
          placeholder="es. MECHANICAL" required />
      </div>

      <div className="form-group">
        <label className="form-label">Nome *</label>
        <input className="form-input" value={form.label} onChange={e => set("label", e.target.value)}
          placeholder="es. Meccanico" required />
      </div>

      <div className="form-group">
        <label className="form-label">Descrizione</label>
        <textarea className="form-input" rows={2} value={form.description}
          onChange={e => set("description", e.target.value)} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Icona (nome risorsa)</label>
          <input className="form-input" value={form.icon_name}
            onChange={e => set("icon_name", e.target.value)} placeholder="es. ic_mechanical" />
        </div>
        <div className="form-group">
          <label className="form-label">Ordine</label>
          <input className="form-input" type="number" min={0} value={form.sort_order}
            onChange={e => set("sort_order", e.target.value)} />
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
