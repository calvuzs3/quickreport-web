import { getFacilities } from "@/lib/api";
import Link from "next/link";
import type { Facility } from "@/types";
import FacilitiesTable from "./FacilitiesTable";

export default async function FacilitiesPage() {
  let items: Facility[] = [];
  let error: string | null = null;

  try {
    const res = await getFacilities();
    items = res.data.filter(i => !i.is_deleted);
  } catch (e) {
    error = e instanceof Error ? e.message : "Errore caricamento dati";
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stabilimenti</h1>
          <p className="page-subtitle">{items.length} stabilimenti</p>
        </div>
        <Link href="/facilities/new" className="btn btn-primary">+ Nuovo</Link>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="table-wrapper">
        <FacilitiesTable items={items} />
      </div>
    </div>
  );
}