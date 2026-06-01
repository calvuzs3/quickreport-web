"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Facility } from "@/types";

const FACILITY_TYPES = ["MANUFACTURING", "WAREHOUSE", "ASSEMBLY", "TESTING", "RESEARCH", "OTHER"];

export default function FacilityEditForm({ facility }: { facility: Facility }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: facility.name, code: facility.code ?? "",
    facility_type: facility.facility_type, notes: facility.notes ?? "",
    is_primary: facility.is_primary, is_active: facility.is_active,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(field: string, value: unknown) { setForm(prev => ({ ...prev, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      const res = await fetch(`/api/facilities/${facility.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...facility, ...form, updated_at: Date.now() }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Errore"); return; }
      router.push(`/facilities/${facility.id}`); router.refresh();
    } catch { setError("Errore di connessione"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href={`/facilities/${facility.id}`} style={{ color: "var(--color-text-muted)", fontSize: 13 }}>← {facility.name}</Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>Modifica stabilimento</h1>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && <div className="alert alert-error">{error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Nome *</label>
              <input className="form-input" type="text" value={form.name}
                onChange={e => set("name", e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Codice</label>
              <input className="form-input" type="text" value={form.code}
                onChange={e => set("code", e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Tipo *</label>
            <select className="form-select" value={form.facility_type}
              onChange={e => set("facility_type", e.target.value)}>
              {FACILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Note</label>
            <textarea className="form-textarea" value={form.notes} onChange={e => set("notes", e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={form.is_primary} onChange={e => set("is_primary", e.target.checked)} />
              <span className="form-label" style={{ margin: 0 }}>Primario</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} />
              <span className="form-label" style={{ margin: 0 }}>Attivo</span>
            </label>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Salvataggio…" : "Salva modifiche"}
            </button>
            <Link href={`/facilities/${facility.id}`} className="btn btn-secondary">Annulla</Link>
          </div>
        </form>
      </div>
    </div>
  );
}