import { getUsers } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import DisableButton from "./[id]/DisableButton";

export default async function UsersPage() {
  await requireAdmin();

  let users: Awaited<ReturnType<typeof getUsers>>["data"] = [];
  let error: string | null = null;

  try {
    const res = await getUsers();
    users = res.data;
  } catch (e) {
    error = e instanceof Error ? e.message : "Errore caricamento utenti";
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Utenti</h1>
          <p className="page-subtitle">{users.length} utenti registrati</p>
        </div>
        <Link href="/users/new" className="btn btn-primary">+ Nuovo utente</Link>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Ruolo</th>
              <th>Stato</th>
              <th>Creato</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--color-text-muted)", padding: 32 }}>
                  Nessun utente trovato
                </td>
              </tr>
            )}
            {users.map(user => (
              <tr key={user.id}>
                <td style={{ fontWeight: 600, fontFamily: "monospace" }}>{user.username}</td>
                <td>
                  <span className={`badge ${user.role === "ADMIN" ? "badge-blue" : "badge-orange"}`}>
                    {user.role === "ADMIN" ? "Admin" : "Tecnico"}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.is_active ? "badge-green" : "badge-red"}`}>
                    {user.is_active ? "Attivo" : "Disattivato"}
                  </span>
                </td>
                <td style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
                  {formatDateTime(user.created_at)}
                </td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <Link href={`/users/${user.id}/edit`} className="btn btn-secondary btn-sm">
                      Modifica
                    </Link>
                    {user.is_active && <DisableButton id={user.id} username={user.username} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
