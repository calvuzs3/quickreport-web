"use client";

import Link from "next/link";
import type { Client } from "@/types";
import SortableTable, { SortableColumn } from "@/components/SortableTable";

const columns: SortableColumn<Client>[] = [
  { header: "Ragione sociale", sortValue: c => c.company_name },
  { header: "Stato" },
  { header: "Note" },
  { header: "" },
];

export default function ClientsTable({ clients }: { clients: Client[] }) {
  return (
    <SortableTable
      items={clients}
      columns={columns}
      keyFor={c => c.id}
      emptyMessage="Nessun cliente trovato"
      renderRow={client => (
        <tr>
          <td style={{ fontWeight: 500 }}>{client.company_name}</td>
          <td>
            <span className={`badge ${client.is_active ? "badge-green" : "badge-red"}`}>
              {client.is_active ? "Attivo" : "Inattivo"}
            </span>
          </td>
          <td style={{ color: "var(--color-text-muted)", maxWidth: 280 }}>
            <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {client.notes ?? "—"}
            </span>
          </td>
          <td style={{ textAlign: "right" }}>
            <Link href={`/clients/${client.id}`} className="btn btn-secondary btn-sm">Dettagli</Link>
          </td>
        </tr>
      )}
    />
  );
}
