"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { generateId } from "@/lib/utils";
import type { Facility } from "@/types";

const ISLAND_TYPES = ["POLY_MOVE", "POLY_CAST", "POLY_EBT", "POLY_WELD", "POLY_PAINT", "OTHER"];

export default function NewIslandPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedFacilityId = searchParams.get("facilityId") ?? "";
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [form, setForm] = useState({
    facility_id: preselectedFacilityId, island_type: "POLY_MOVE",
    serial_number: "", commissioning_number: "", model: "", model_number: "",
    custom_name: "", location: "", notes: "", operating_hours: 0, is_active: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/facilities").then(r => r.json())
      .then(d => setFacilities(d.data.filter((f: Facility) => !f.is_deleted && f.is_active)))
      .catch(() => {});
  }, []);

  function set(field: string, value: unknown) { setForm(prev => ({ ...prev, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null); setLoading(true);
    const now = Date.now();
    const payload = {
      id: generateId(), ...form,
      operating_hours: Number(form.operating_hours), cycle_count: 0,
      installation_date: null, warranty_expiration: null,
      last_maintenance_date: null, next_scheduled_maintenance: null,
      created_at: now, updated_at: now, synced_at: null, is_deleted: false,
    };
    try {
      const res = await fetch("/api/islands", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Errore"); return; }
      const created = await res.json();
      router.push(`/islands/${created.id}`); router.refresh();
    } catch { setError("Errore di connessione"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/islands" style={{ color: "var(--color-text-muted)", fontSize: 13 }}>← Isole</Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>Nuova isola robotizzata</h1>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 680 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Stabilimento *</label>
            <select className="form-select" value={form.facility_id}
              onChange={e => set("facility_id", e.target.value)} required>
              <option value="">— Seleziona stabilimento —</option>
              {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Tipo isola *</label>
              <select className="form-select" value={form.island_type}
                onChange={e => set("island_type", e.target.value)}>
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
              {loading ? "Salvataggio…" : "Crea isola"}
            </button>
            <Link href="/islands" className="btn btn-secondary">Annulla</Link>
          </div>
        </form>
      </div>
    </div>
  );
}