"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CheckupStatus } from "@/types";
import { generateId } from "@/lib/utils";

export default function CheckupStatusEditForm({ initial }: { initial?: CheckupStatus }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: initial?.code ?? "",
    label: initial?.label ?? "",
    color_hex: initial?.color_hex ?? "#808080",
    icon_emoji: initial?.icon_emoji ?? "",
    sort_order: initial?.sort_order ?? 0,
    is_active: initial?.is_active ?? true,
    blocks_deletion: initial?.blocks_deletion ?? false,
    marks_completion: initial?.marks_completion ?? false,
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
      color_hex: form.color_hex,
      icon_emoji: form.icon_emoji.trim() || null,
      sort_order: Number(form.sort_order),
      is_active: form.is_active,
      blocks_deletion: form.blocks_deletion,
      marks_completion: form.marks_completion,
      created_at: initial?.created_at ?? now,
      updated_at: now,
    };

    try {
      const res = initial
        ? await fetch(`/api/checkup-statuses/${initial.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/checkup-statuses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Errore ${res.status}: ${text}`);
      }
      router.push("/checkup-statuses");
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
          placeholder="es. IN_PROGRESS" required />
      </div>

      <div className="form-group">
        <label className="form-label">Nome *</label>
        <input className="form-input" value={form.label} onChange={e => set("label", e.target.value)}
          placeholder="es. In corso" required />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Colore *</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="color" value={form.color_hex} onChange={e => set("color_hex", e.target.value)}
              style={{ width: 40, height: 36, padding: 2, border: "1px solid var(--color-border)", borderRadius: 6 }} />
            <input className="form-input" value={form.color_hex} onChange={e => set("color_hex", e.target.value)}
              placeholder="#1976D2" style={{ flex: 1 }} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Emoji icona</label>
          <input className="form-input" value={form.icon_emoji} onChange={e => set("icon_emoji", e.target.value)}
            placeholder="🔄" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Ordine visualizzazione</label>
        <input className="form-input" type="number" min={0} value={form.sort_order}
          onChange={e => set("sort_order", e.target.value)} />
      </div>

      <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={form.marks_completion}
            onChange={e => set("marks_completion", e.target.checked)} />
          Segna completamento (il checkup viene considerato concluso)
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={form.blocks_deletion}
            onChange={e => set("blocks_deletion", e.target.checked)} />
          Blocca eliminazione (impedisce la cancellazione del checkup)
        </label>
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
