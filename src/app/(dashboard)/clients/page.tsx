import { getClients } from "@/lib/api";
import Link from "next/link";
import type { Client } from "@/types";
import ClientsTable from "./ClientsTable";

export default async function ClientsPage() {
  let clients: Client[] = [];
  let error: string | null = null;

  try {
    const res = await getClients();
    clients = res.data.filter(c => !c.is_deleted);
  } catch (e) {
    error = e instanceof Error ? e.message : "Errore caricamento clienti";
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clienti</h1>
          <p className="page-subtitle">{clients.length} clienti attivi</p>
        </div>
        <Link href="/clients/new" className="btn btn-primary">+ Nuovo cliente</Link>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="table-wrapper">
        <ClientsTable clients={clients} />
      </div>
    </div>
  );
}