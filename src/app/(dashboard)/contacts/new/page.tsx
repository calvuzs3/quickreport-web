"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { generateId } from "@/lib/utils";
import type { Client } from "@/types";

const CONTACT_METHODS = ["EMAIL", "PHONE", "MOBILE", "ANY"];

export default function NewContactPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId") ?? "";
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({
    client_id: preselectedClientId, first_name: "", last_name: "",
    title: "", role: "", department: "", phone: "", mobile_phone: "",
    email: "", alternative_email: "", preferred_contact_method: "EMAIL",
    notes: "", is_primary: false, is_active: true,
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
    const payload = { id: generateId(), ...form, created_at: now, updated_at: now, synced_at: null, is_deleted: false };
    try {
      const res = await fetch("/api/contacts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Errore"); return; }
      const created = await res.json();
      router.push(`/contacts/${created.id}`); router.refresh();
    } catch { setError("Errore di connessione"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/contacts" style={{ color: "var(--color-text-muted)", fontSize: 13 }}>← Contatti</Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>Nuovo contatto</h1>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 680 }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Titolo</label>
              <input className="form-input" type="text" value={form.title}
                onChange={e => set("title", e.target.value)} placeholder="Dr." />
            </div>
            <div className="form-group">
              <label className="form-label">Nome *</label>
              <input className="form-input" type="text" value={form.first_name}
                onChange={e => set("first_name", e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Cognome</label>
              <input className="form-input" type="text" value={form.last_name}
                onChange={e => set("last_name", e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Ruolo</label>
              <input className="form-input" type="text" value={form.role}
                onChange={e => set("role", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Dipartimento</label>
              <input className="form-input" type="text" value={form.department}
                onChange={e => set("department", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email}
                onChange={e => set("email", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email alternativa</label>
              <input className="form-input" type="email" value={form.alternative_email}
                onChange={e => set("alternative_email", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Telefono</label>
              <input className="form-input" type="tel" value={form.phone}
                onChange={e => set("phone", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Cellulare</label>
              <input className="form-input" type="tel" value={form.mobile_phone}
                onChange={e => set("mobile_phone", e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Metodo preferito</label>
            <select className="form-select" value={form.preferred_contact_method}
              onChange={e => set("preferred_contact_method", e.target.value)}>
              {CONTACT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Note</label>
            <textarea className="form-textarea" value={form.notes} onChange={e => set("notes", e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={form.is_primary} onChange={e => set("is_primary", e.target.checked)} />
              <span className="form-label" style={{ margin: 0 }}>Contatto principale</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} />
              <span className="form-label" style={{ margin: 0 }}>Attivo</span>
            </label>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Salvataggio…" : "Crea contatto"}
            </button>
            <Link href="/contacts" className="btn btn-secondary">Annulla</Link>
          </div>
        </form>
      </div>
    </div>
  );
}