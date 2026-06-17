"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { generateId } from "@/lib/utils";

export default function NewIslandTypePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    code: "",
    label: "",
    description: "",
    icon_name: "",
    maintenance_interval_days: 180,
    sort_order: 0,
    is_active: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const now = Date.now();
    const payload = { id: generateId(), ...form, created_at: now, updated_at: now, synced_at: null, is_deleted: false };
    try {
      const res = await fetch("/api/island-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Errore"); return; }
      router.push("/island-types");
      router.refresh();
    } catch { setError("Errore di connessione"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/island-types" style={{ color: "var(--color-text-muted)", fontSize: 13 }}>← Tipi isola</Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>Nuovo tipo isola</h1>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Codice *</label>
            <input className="form-input" type="text" value={form.code}
              onChange={e => set("code", e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Nome *</label>
            <input className="form-input" type="text" value={form.label}
              onChange={e => set("label", e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Descrizione</label>
            <textarea className="form-textarea" value={form.description}
              onChange={e => set("description", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Icona</label>
            <input className="form-input" type="text" value={form.icon_name}
              onChange={e => set("icon_name", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Intervallo manutenzione (giorni)</label>
            <input className="form-input" type="number" min={1} value={form.maintenance_interval_days}
              onChange={e => set("maintenance_interval_days", Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">Ordine</label>
            <input className="form-input" type="number" value={form.sort_order}
              onChange={e => set("sort_order", Number(e.target.value))} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={form.is_active}
              onChange={e => set("is_active", e.target.checked)} />
            <span className="form-label" style={{ margin: 0 }}>Tipo attivo</span>
          </label>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Salvataggio…" : "Crea tipo"}
            </button>
            <Link href="/island-types" className="btn btn-secondary">Annulla</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
