"use client";

import Link from "next/link";
import type { Contact } from "@/types";
import SortableTable, { SortableColumn } from "@/components/SortableTable";

const columns: SortableColumn<Contact>[] = [
  { header: "Nome", sortValue: c => `${c.first_name} ${c.last_name}` },
  { header: "Ruolo" },
  { header: "Email" },
  { header: "Telefono" },
  { header: "Stato" },
  { header: "" },
];

export default function ContactsTable({ items }: { items: Contact[] }) {
  return (
    <SortableTable
      items={items}
      columns={columns}
      keyFor={c => c.id}
      emptyMessage="Nessun contatto trovato"
      renderRow={item => (
        <tr>
          <td style={{ fontWeight: 500 }}>{item.first_name} {item.last_name}</td>
          <td style={{ color: "var(--color-text-muted)" }}>{item.role ?? "—"}</td>
          <td>{item.email ?? "—"}</td>
          <td>{item.mobile_phone ?? item.phone ?? "—"}</td>
          <td><span className={`badge ${item.is_active ? "badge-green" : "badge-red"}`}>
            {item.is_active ? "Attivo" : "Inattivo"}
          </span></td>
          <td style={{ textAlign: "right" }}>
            <Link href={`/contacts/${item.id}`} className="btn btn-secondary btn-sm">Dettagli</Link>
          </td>
        </tr>
      )}
    />
  );
}
