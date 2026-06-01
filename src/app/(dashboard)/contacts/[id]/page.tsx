import { getContact, getClient } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, formatDateTime } from "@/lib/utils";
import DeleteButton from "./DeleteButton";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let contact, client;
  try {
    contact = await getContact(id);
    client = await getClient(contact.client_id).catch(() => null);
  } catch { notFound(); }
  if (contact.is_deleted) notFound();

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/contacts" style={{ color: "var(--color-text-muted)", fontSize: 13 }}>← Contatti</Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>{contact.first_name} {contact.last_name}</h1>
          <p className="page-subtitle" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {contact.is_primary && <span className="badge badge-orange">Principale</span>}
            <span className={`badge ${contact.is_active ? "badge-green" : "badge-red"}`}>
              {contact.is_active ? "Attivo" : "Inattivo"}
            </span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/contacts/${id}/edit`} className="btn btn-secondary">Modifica</Link>
          <DeleteButton id={id} name={`${contact.first_name} ${contact.last_name ?? ""}`} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Dati anagrafici</h2>
          <dl style={{ display: "grid", gap: 10 }}>
            <InfoRow label="Titolo" value={contact.title} />
            <InfoRow label="Nome" value={contact.first_name} />
            <InfoRow label="Cognome" value={contact.last_name} />
            <InfoRow label="Ruolo" value={contact.role} />
            <InfoRow label="Dipartimento" value={contact.department} />
          </dl>
        </div>
        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Recapiti</h2>
          <dl style={{ display: "grid", gap: 10 }}>
            <InfoRow label="Email" value={contact.email} />
            <InfoRow label="Email alternativa" value={contact.alternative_email} />
            <InfoRow label="Telefono" value={contact.phone} />
            <InfoRow label="Cellulare" value={contact.mobile_phone} />
            <InfoRow label="Metodo preferito" value={contact.preferred_contact_method} />
          </dl>
        </div>
        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Cliente</h2>
          {client ? (
            <Link href={`/clients/${client.id}`} style={{
              display: "block", padding: "10px 12px",
              border: "1px solid var(--color-border)", borderRadius: "var(--radius)", color: "inherit",
            }}>
              <div style={{ fontWeight: 500 }}>{client.company_name}</div>
            </Link>
          ) : (
            <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Cliente non trovato</p>
          )}
        </div>
        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Note e date</h2>
          <dl style={{ display: "grid", gap: 10 }}>
            <InfoRow label="Note" value={contact.notes} />
            <InfoRow label="Creato" value={formatDate(contact.created_at)} />
            <InfoRow label="Ultima modifica" value={formatDateTime(contact.updated_at)} />
          </dl>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <dt style={{ fontSize: 12, color: "var(--color-text-muted)", width: 150, flexShrink: 0 }}>{label}</dt>
      <dd style={{ fontSize: 13 }}>{value ?? "—"}</dd>
    </div>
  );
}