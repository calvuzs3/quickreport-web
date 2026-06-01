"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { generateId } from "@/lib/utils";
import type { Client } from "@/types";

export default function NewContractPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId") ?? "";
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({
    client_id: preselectedClientId, name: "", description: "",
    start_date: new Date().toISOString().split("T")[0], end_date: "",
    has_priority: true, has_remote_assistance: true, has_maintenance: true,
    notes: "", is_active: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/clients").then(r => r.json())
      .then(d => setClients(d.data.filter((c: Client) => !c.is_deleted && c.is_active)))
      .catch(() => {});
  }, []);

  function set(field: string, value: unknown) { setForm(prev => ({ ...prev, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null); setLoading(true);
    const now = Date.now();
    const payload = {
      id: generateId(), ...form,
      start_date: new Date(form.start_date).getTime(),
      end_date: new Date(form.end_date).getTime(),
      created_at: now, updated_at: now, synced_at: null, is_deleted: false,
    };
    try {
      const res = await fetch("/api/contracts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Errore"); return; }
      const created = await res.json();
      router.push(`/contracts/${created.id}`); router.refresh();
    } catch { setError("Errore di connessione"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/contracts" style={{ color: "var(--color-text-muted)", fontSize: 13 }}>← Contratti</Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>Nuovo contratto</h1>
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

          <div className="form-group">
            <label className="form-label">Nome contratto</label>
            <input className="form-input" type="text" value={form.name}
              onChange={e => set("name", e.target.value)}
              placeholder="es. Contratto manutenzione 2026" autoFocus />
          </div>

          <div className="form-group">
            <label className="form-label">Descrizione</label>
            <textarea className="form-textarea" value={form.description}
              onChange={e => set("description", e.target.value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Data inizio *</label>
              <input className="form-input" type="date" value={form.start_date}
                onChange={e => set("start_date", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Data scadenza *</label>
              <input className="form-input" type="date" value={form.end_date}
                onChange={e => set("end_date", e.target.value)} required />
            </div>
          </div>

          <div>
            <p className="form-label" style={{ marginBottom: 8 }}>Servizi inclusi</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { field: "has_priority", label: "Interventi prioritari" },
                { field: "has_remote_assistance", label: "Assistenza remota" },
                { field: "has_maintenance", label: "Manutenzione programmata" },
              ].map(({ field, label }) => (
                <label key={field} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox"
                    checked={form[field as keyof typeof form] as boolean}
                    onChange={e => set(field, e.target.checked)} />
                  <span style={{ fontSize: 13 }}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Note</label>
            <textarea className="form-textarea" value={form.notes}
              onChange={e => set("notes", e.target.value)} />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={form.is_active}
              onChange={e => set("is_active", e.target.checked)} />
            <span className="form-label" style={{ margin: 0 }}>Contratto attivo</span>
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Salvataggio…" : "Crea contratto"}
            </button>
            <Link href="/contracts" className="btn btn-secondary">Annulla</Link>
          </div>
        </form>
      </div>
    </div>
  );
}