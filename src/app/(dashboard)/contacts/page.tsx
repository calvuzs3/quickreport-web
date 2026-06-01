import { getContacts } from "@/lib/api";
import Link from "next/link";
import type { Contact } from "@/types";

export default async function ContactsPage() {
  let items: Contact[] = [];
  let error: string | null = null;
  try {
    const res = await getContacts();
    items = res.data.filter(i => !i.is_deleted);
  } catch (e) { error = e instanceof Error ? e.message : "Errore caricamento dati"; }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Contatti</h1>
          <p className="page-subtitle">{items.length} contatti</p>
        </div>
        <Link href="/contacts/new" className="btn btn-primary">+ Nuovo</Link>
      </div>
      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
      <div className="table-wrapper">
        <table>
          <thead><tr><th>Nome</th><th>Ruolo</th><th>Email</th><th>Telefono</th><th>Stato</th><th></th></tr></thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--color-text-muted)", padding: 32 }}>
                Nessun contatto trovato
              </td></tr>
            )}
            {items.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 500 }}>{item.first_name} {item.last_name}</td>
                <td style={{ color: "var(--color-text-muted)" }}>{item.role ?? "—"}</td>
                <td>{item.email ?? "—"}</td>
                <td>{item.mobile_phone ?? item.phone ?? "—"}</td>
                <td><span className={`badge ${item.is_active ? "badge-green" : "badge-red"}`}>
                  {item.is_active ? "Attivo" : "Inattivo"}
                </span></td>
                <td style={{ textAlign: "right" }}>
                  <Link href={`/contacts/${item.id}`} className="btn btn-secondary btn-sm">Dettagli</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}