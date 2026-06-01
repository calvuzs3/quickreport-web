"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { generateId } from "@/lib/utils";
import type { Client } from "@/types";

const FACILITY_TYPES = ["MANUFACTURING", "WAREHOUSE", "ASSEMBLY", "TESTING", "RESEARCH", "OTHER"];

export default function NewFacilityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId") ?? "";

  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({
    client_id: preselectedClientId,
    name: "", code: "", facility_type: "MANUFACTURING",
    notes: "", is_primary: false, is_active: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/clients").then(r => r.json())
      .then(d => setClients(d.data.filter((c: Client) => !c.is_deleted && c.is_active)))
      .catch(() => {});
  }, []);

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
      const res = await fetch("/api/facilities", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Errore"); return; }
      const created = await res.json();
      router.push(`/facilities/${created.id}`);
      router.refresh();
    } catch { setError("Errore di connessione"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/facilities" style={{ color: "var(--color-text-muted)", fontSize: 13 }}>← Stabilimenti</Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>Nuovo stabilimento</h1>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Cliente *</label>
            <select className="form-select" value={form.client_id}
              onChange={e => set("client_id", e.target.value)} required>
              <option value="">— Seleziona cliente —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Nome *</label>
              <input className="form-input" type="text" value={form.name}
                onChange={e => set("name", e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Codice</label>
              <input className="form-input" type="text" value={form.code}
                onChange={e => set("code", e.target.value)} placeholder="es. STAB-01" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tipo stabilimento *</label>
            <select className="form-select" value={form.facility_type}
              onChange={e => set("facility_type", e.target.value)}>
              {FACILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Note</label>
            <textarea className="form-textarea" value={form.notes}
              onChange={e => set("notes", e.target.value)} />
          </div>

          <div style={{ display: "flex", gap: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={form.is_primary}
                onChange={e => set("is_primary", e.target.checked)} />
              <span className="form-label" style={{ margin: 0 }}>Stabilimento primario</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={form.is_active}
                onChange={e => set("is_active", e.target.checked)} />
              <span className="form-label" style={{ margin: 0 }}>Attivo</span>
            </label>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Salvataggio…" : "Crea stabilimento"}
            </button>
            <Link href="/facilities" className="btn btn-secondary">Annulla</Link>
          </div>
        </form>
      </div>
    </div>
  );
}