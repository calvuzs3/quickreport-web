"use client";

import Link from "next/link";
import type { FacilityIsland } from "@/types";
import SortableTable, { SortableColumn } from "@/components/SortableTable";

const columns: SortableColumn<FacilityIsland>[] = [
  { header: "Nome / Seriale", sortValue: i => i.custom_name ?? i.serial_number },
  { header: "Tipo" },
  { header: "N° Commessa" },
  { header: "Stato" },
  { header: "" },
];

export default function IslandsTable({ items }: { items: FacilityIsland[] }) {
  return (
    <SortableTable
      items={items}
      columns={columns}
      keyFor={i => i.id}
      emptyMessage="Nessuna isola trovata"
      renderRow={item => (
        <tr>
          <td style={{ fontWeight: 500 }}>{item.custom_name ?? item.serial_number}</td>
          <td><span className="badge badge-blue">{item.island_type}</span></td>
          <td style={{ color: "var(--color-text-muted)" }}>{item.commissioning_number ?? "—"}</td>
          <td><span className={`badge ${item.is_active ? "badge-green" : "badge-red"}`}>
            {item.is_active ? "Attiva" : "Inattiva"}
          </span></td>
          <td style={{ textAlign: "right" }}>
            <Link href={`/islands/${item.id}`} className="btn btn-secondary btn-sm">Dettagli</Link>
          </td>
        </tr>
      )}
    />
  );
}
