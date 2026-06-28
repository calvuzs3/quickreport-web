"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { UserRole } from "@/types";

export default function NewUserPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("TECHNICIAN");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Le password non coincidono.");
      return;
    }
    if (password.length < 6) {
      setError("La password deve essere di almeno 6 caratteri.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password, role }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Errore ${res.status}`);
      }

      router.push("/users");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore creazione utente");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/users" style={{ color: "var(--color-text-muted)", fontSize: 13 }}>← Utenti</Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>Nuovo utente</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Username *</label>
          <input
            className="form-input"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="es. mario.rossi"
            autoComplete="username"
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Ruolo *</label>
          <select className="form-select" value={role} onChange={e => setRole(e.target.value as UserRole)}>
            <option value="TECHNICIAN">Tecnico</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Password *</label>
          <input
            className="form-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Conferma password *</label>
          <input
            className="form-input"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <div className="form-actions">
          <Link href="/users" className="btn btn-secondary">Annulla</Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Creazione…" : "Crea utente"}
          </button>
        </div>
      </form>
    </div>
  );
}
