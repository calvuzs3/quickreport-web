"use client";

import Link from "next/link";
import type { Facility } from "@/types";
import SortableTable, { SortableColumn } from "@/components/SortableTable";

const columns: SortableColumn<Facility>[] = [
  { header: "Nome", sortValue: f => f.name },
  { header: "Tipo" },
  { header: "Codice" },
  { header: "Stato" },
  { header: "" },
];

export default function FacilitiesTable({ items }: { items: Facility[] }) {
  return (
    <SortableTable
      items={items}
      columns={columns}
      keyFor={f => f.id}
      emptyMessage="Nessuno stabilimento trovato"
      renderRow={item => (
        <tr>
          <td style={{ fontWeight: 500 }}>{item.name}</td>
          <td style={{ color: "var(--color-text-muted)" }}>{item.facility_type}</td>
          <td style={{ color: "var(--color-text-muted)" }}>{item.code ?? "—"}</td>
          <td>
            <span className={`badge ${item.is_active ? "badge-green" : "badge-red"}`}>
              {item.is_active ? "Attivo" : "Inattivo"}
            </span>
          </td>
          <td style={{ textAlign: "right" }}>
            <Link href={`/facilities/${item.id}`} className="btn btn-secondary btn-sm">Dettagli</Link>
          </td>
        </tr>
      )}
    />
  );
}
