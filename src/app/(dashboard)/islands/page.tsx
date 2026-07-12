import { getIslands } from "@/lib/api";
import Link from "next/link";
import type { FacilityIsland } from "@/types";
import IslandsTable from "./IslandsTable";

export default async function IslandsPage() {
  let items: FacilityIsland[] = [];
  let error: string | null = null;
  try {
    const res = await getIslands();
    items = res.data.filter(i => !i.is_deleted);
  } catch (e) { error = e instanceof Error ? e.message : "Errore caricamento dati"; }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Isole robotizzate</h1>
          <p className="page-subtitle">{items.length} isole</p>
        </div>
        <Link href="/islands/new" className="btn btn-primary">+ Nuova</Link>
      </div>
      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
      <div className="table-wrapper">
        <IslandsTable items={items} />
      </div>
    </div>
  );
}