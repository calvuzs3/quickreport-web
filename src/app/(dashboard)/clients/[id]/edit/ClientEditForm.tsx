"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Client, Address } from "@/types";
import { parseAddress, serializeAddress } from "@/lib/address";
import AddressFields from "@/components/AddressFields";

export default function ClientEditForm({ client }: { client: Client }) {
  const router = useRouter();
  const [form, setForm] = useState({
    company_name: client.company_name,
    notes: client.notes ?? "",
    is_active: client.is_active,
  });
  const [address, setAddress] = useState<Address>(parseAddress(client.headquarters_json) ?? { country: "Italia" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...client, ...form, headquarters_json: serializeAddress(address), updated_at: Date.now(),
        }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Errore"); return; }
      router.push(`/clients/${client.id}`);
      router.refresh();
    } catch { setError("Errore di connessione"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href={`/clients/${client.id}`} style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
            ← {client.company_name}
          </Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>Modifica cliente</h1>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Ragione sociale *</label>
            <input className="form-input" type="text" value={form.company_name}
              onChange={e => set("company_name", e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Note</label>
            <textarea className="form-textarea" value={form.notes}
              onChange={e => set("notes", e.target.value)} />
          </div>

          <h2 style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>Sede legale</h2>
          <AddressFields value={address} onChange={setAddress} />

          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={form.is_active}
              onChange={e => set("is_active", e.target.checked)} />
            <span className="form-label" style={{ margin: 0 }}>Cliente attivo</span>
          </label>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Salvataggio…" : "Salva modifiche"}
            </button>
            <Link href={`/clients/${client.id}`} className="btn btn-secondary">Annulla</Link>
          </div>
        </form>
      </div>
    </div>
  );
}