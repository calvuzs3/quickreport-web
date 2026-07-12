import { getContacts } from "@/lib/api";
import Link from "next/link";
import type { Contact } from "@/types";
import ContactsTable from "./ContactsTable";

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
        <ContactsTable items={items} />
      </div>
    </div>
  );
}