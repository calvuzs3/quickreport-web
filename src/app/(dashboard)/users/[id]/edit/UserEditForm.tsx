"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";

export default function UserEditForm({ user }: { user: User }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [role, setRole] = useState(user.role);
  const [isActive, setIsActive] = useState(user.is_active);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword && newPassword !== confirmPassword) {
      setError("Le password non coincidono.");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setError("La nuova password deve essere di almeno 6 caratteri.");
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = { role, is_active: isActive };
      if (newPassword) body.password = newPassword;

      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Errore ${res.status}`);
      }

      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Utente aggiornato.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore salvataggio");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-card">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-group">
        <label className="form-label">Username</label>
        <input className="form-input" value={user.username} disabled
          style={{ opacity: 0.6, cursor: "not-allowed" }} />
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          Lo username non può essere modificato.
        </span>
      </div>

      <div className="form-group">
        <label className="form-label">Ruolo</label>
        <select className="form-select" value={role} onChange={e => setRole(e.target.value as typeof role)}>
          <option value="TECHNICIAN">Tecnico</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className="form-group">
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
          <span className="form-label" style={{ marginBottom: 0 }}>Utente attivo</span>
        </label>
      </div>

      <fieldset style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: "16px" }}>
        <legend style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", padding: "0 6px" }}>
          Reset password (opzionale)
        </legend>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Nuova password</label>
            <input className="form-input" type="password" value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Lascia vuoto per non modificare" autoComplete="new-password" />
          </div>
          <div className="form-group">
            <label className="form-label">Conferma password</label>
            <input className="form-input" type="password" value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Ripeti la nuova password" autoComplete="new-password" />
          </div>
        </div>
      </fieldset>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={() => router.push("/users")}>
          Annulla
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Salvataggio…" : "Salva"}
        </button>
      </div>
    </form>
  );
}
