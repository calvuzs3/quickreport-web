import { getContracts } from "@/lib/api";
import Link from "next/link";
import type { Contract } from "@/types";
import ContractsTable from "./ContractsTable";

export default async function ContractsPage() {
  let items: Contract[] = [];
  let error: string | null = null;
  try {
    const res = await getContracts();
    items = res.data.filter(i => !i.is_deleted);
  } catch (e) { error = e instanceof Error ? e.message : "Errore caricamento dati"; }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Contratti</h1>
          <p className="page-subtitle">{items.length} contratti</p>
        </div>
        <Link href="/contracts/new" className="btn btn-primary">+ Nuovo</Link>
      </div>
      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
      <div className="table-wrapper">
        <ContractsTable items={items} />
      </div>
    </div>
  );
}