"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Contract } from "@/types";

function epochToDate(ms: number): string {
  return new Date(ms).toISOString().split("T")[0];
}

export default function ContractEditForm({ contract }: { contract: Contract }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: contract.name ?? "", description: contract.description ?? "",
    start_date: epochToDate(contract.start_date), end_date: epochToDate(contract.end_date),
    has_priority: contract.has_priority, has_remote_assistance: contract.has_remote_assistance,
    has_maintenance: contract.has_maintenance, notes: contract.notes ?? "",
    is_active: contract.is_active,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(field: string, value: unknown) { setForm(prev => ({ ...prev, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      const payload = {
        ...contract, ...form,
        start_date: new Date(form.start_date).getTime(),
        end_date: new Date(form.end_date).getTime(),
        updated_at: Date.now(),
      };
      const res = await fetch(`/api/contracts/${contract.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Errore"); return; }
      router.push(`/contracts/${contract.id}`); router.refresh();
    } catch { setError("Errore di connessione"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href={`/contracts/${contract.id}`} style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
            ← {contract.name ?? "Contratto"}
          </Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>Modifica contratto</h1>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Nome contratto</label>
            <input className="form-input" type="text" value={form.name}
              onChange={e => set("name", e.target.value)} autoFocus />
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
              {loading ? "Salvataggio…" : "Salva modifiche"}
            </button>
            <Link href={`/contracts/${contract.id}`} className="btn btn-secondary">Annulla</Link>
          </div>
        </form>
      </div>
    </div>
  );
}