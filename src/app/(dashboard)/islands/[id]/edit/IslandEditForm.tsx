"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { FacilityIsland } from "@/types";

const ISLAND_TYPES = ["POLY_MOVE", "POLY_CAST", "POLY_EBT", "POLY_WELD", "POLY_PAINT", "OTHER"];

function epochToDate(ms: number | null | undefined): string {
  if (!ms) return "";
  return new Date(ms).toISOString().split("T")[0];
}

export default function IslandEditForm({ island }: { island: FacilityIsland }) {
  const router = useRouter();
  const [form, setForm] = useState({
    island_type: island.island_type, serial_number: island.serial_number,
    commissioning_number: island.commissioning_number ?? "",
    model: island.model ?? "", model_number: island.model_number ?? "",
    custom_name: island.custom_name ?? "", location: island.location ?? "",
    operating_hours: island.operating_hours, cycle_count: island.cycle_count,
    installation_date: epochToDate(island.installation_date),
    warranty_expiration: epochToDate(island.warranty_expiration),
    last_maintenance_date: epochToDate(island.last_maintenance_date),
    next_scheduled_maintenance: epochToDate(island.next_scheduled_maintenance),
    notes: island.notes ?? "", is_active: island.is_active,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(field: string, value: unknown) { setForm(prev => ({ ...prev, [field]: value })); }
  function dateToEpoch(s: string): number | null { return s ? new Date(s).getTime() : null; }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      const payload = {
        ...island, ...form,
        operating_hours: Number(form.operating_hours),
        cycle_count: Number(form.cycle_count),
        installation_date: dateToEpoch(form.installation_date),
        warranty_expiration: dateToEpoch(form.warranty_expiration),
        last_maintenance_date: dateToEpoch(form.last_maintenance_date),
        next_scheduled_maintenance: dateToEpoch(form.next_scheduled_maintenance),
        updated_at: Date.now(),
      };
      const res = await fetch(`/api/islands/${island.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Errore"); return; }
      router.push(`/islands/${island.id}`); router.refresh();
    } catch { setError("Errore di connessione"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href={`/islands/${island.id}`} style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
            ← {island.custom_name ?? island.serial_number}
          </Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>Modifica isola</h1>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 680 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && <div className="alert alert-error">{error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Tipo isola *</label>
              <select className="form-select" value={form.island_type} onChange={e => set("island_type", e.target.value)}>
                {ISLAND_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Numero seriale *</label>
              <input className="form-input" type="text" value={form.serial_number}
                onChange={e => set("serial_number", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">N° Commessa</label>
              <input className="form-input" type="text" value={form.commissioning_number}
                onChange={e => set("commissioning_number", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Nome personalizzato</label>
              <input className="form-input" type="text" value={form.custom_name}
                onChange={e => set("custom_name", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Modello</label>
              <input className="form-input" type="text" value={form.model}
                onChange={e => set("model", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Posizione</label>
              <input className="form-input" type="text" value={form.location}
                onChange={e => set("location", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Ore operative</label>
              <input className="form-input" type="number" min={0} value={form.operating_hours}
                onChange={e => set("operating_hours", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Data installazione</label>
              <input className="form-input" type="date" value={form.installation_date}
                onChange={e => set("installation_date", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Scadenza garanzia</label>
              <input className="form-input" type="date" value={form.warranty_expiration}
                onChange={e => set("warranty_expiration", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Ultima manutenzione</label>
              <input className="form-input" type="date" value={form.last_maintenance_date}
                onChange={e => set("last_maintenance_date", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Prossima manutenzione</label>
              <input className="form-input" type="date" value={form.next_scheduled_maintenance}
                onChange={e => set("next_scheduled_maintenance", e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Note</label>
            <textarea className="form-textarea" value={form.notes} onChange={e => set("notes", e.target.value)} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} />
            <span className="form-label" style={{ margin: 0 }}>Isola attiva</span>
          </label>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Salvataggio…" : "Salva modifiche"}
            </button>
            <Link href={`/islands/${island.id}`} className="btn btn-secondary">Annulla</Link>
          </div>
        </form>
      </div>
    </div>
  );
}