"use client";

import Link from "next/link";
import type { Contract } from "@/types";
import { formatDate } from "@/lib/utils";
import SortableTable, { SortableColumn } from "@/components/SortableTable";

const columns: SortableColumn<Contract>[] = [
  { header: "Nome", sortValue: c => c.name ?? "" },
  { header: "Inizio" },
  { header: "Scadenza" },
  { header: "Servizi" },
  { header: "Stato" },
  { header: "" },
];

export default function ContractsTable({ items }: { items: Contract[] }) {
  return (
    <SortableTable
      items={items}
      columns={columns}
      keyFor={c => c.id}
      emptyMessage="Nessun contratto trovato"
      renderRow={item => (
        <tr>
          <td style={{ fontWeight: 500 }}>{item.name ?? "—"}</td>
          <td style={{ color: "var(--color-text-muted)" }}>{formatDate(item.start_date)}</td>
          <td style={{ color: "var(--color-text-muted)" }}>{formatDate(item.end_date)}</td>
          <td>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {item.has_priority && <span className="badge badge-orange">Priorità</span>}
              {item.has_remote_assistance && <span className="badge badge-blue">Remoto</span>}
              {item.has_maintenance && <span className="badge badge-green">Manut.</span>}
            </div>
          </td>
          <td>
            <span className={`badge ${item.is_active ? "badge-green" : "badge-red"}`}>
              {item.is_active ? "Attivo" : "Inattivo"}
            </span>
          </td>
          <td style={{ textAlign: "right" }}>
            <Link href={`/contracts/${item.id}`} className="btn btn-secondary btn-sm">Dettagli</Link>
          </td>
        </tr>
      )}
    />
  );
}
