"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Contact } from "@/types";

const CONTACT_METHODS = ["EMAIL", "PHONE", "MOBILE", "ANY"];

export default function ContactEditForm({ contact }: { contact: Contact }) {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: contact.first_name, last_name: contact.last_name ?? "",
    title: contact.title ?? "", role: contact.role ?? "",
    department: contact.department ?? "", phone: contact.phone ?? "",
    mobile_phone: contact.mobile_phone ?? "", email: contact.email ?? "",
    alternative_email: contact.alternative_email ?? "",
    preferred_contact_method: contact.preferred_contact_method ?? "EMAIL",
    notes: contact.notes ?? "", is_primary: contact.is_primary, is_active: contact.is_active,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(field: string, value: unknown) { setForm(prev => ({ ...prev, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contact, ...form, updated_at: Date.now() }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Errore"); return; }
      router.push(`/contacts/${contact.id}`); router.refresh();
    } catch { setError("Errore di connessione"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href={`/contacts/${contact.id}`} style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
            ← {contact.first_name} {contact.last_name}
          </Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>Modifica contatto</h1>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 680 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && <div className="alert alert-error">{error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Titolo</label>
              <input className="form-input" type="text" value={form.title} onChange={e => set("title", e.target.value)} />
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
              <input className="form-input" type="text" value={form.role} onChange={e => set("role", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Dipartimento</label>
              <input className="form-input" type="text" value={form.department} onChange={e => set("department", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email alternativa</label>
              <input className="form-input" type="email" value={form.alternative_email}
                onChange={e => set("alternative_email", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Telefono</label>
              <input className="form-input" type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} />
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
              <span className="form-label" style={{ margin: 0 }}>Principale</span>
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
            <Link href={`/contacts/${contact.id}`} className="btn btn-secondary">Annulla</Link>
          </div>
        </form>
      </div>
    </div>
  );
}