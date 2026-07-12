"use client";

import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { MaintenanceLog } from "@/types";
import SortableTable, { SortableColumn } from "@/components/SortableTable";

const columns: SortableColumn<MaintenanceLog>[] = [
  { header: "Data", sortValue: l => l.performed_at },
  { header: "Tipo operazione" },
  { header: "Componente" },
  { header: "Esito" },
  { header: "Tecnico", sortValue: l => l.technician_name },
  { header: "Durata" },
  { header: "" },
];

export default function MaintenanceLogsTable({ islandId, logs }: { islandId: string; logs: MaintenanceLog[] }) {
  return (
    <SortableTable
      items={logs}
      columns={columns}
      keyFor={l => l.id}
      emptyMessage="Nessun intervento registrato"
      renderRow={log => (
        <tr>
          <td style={{ whiteSpace: "nowrap" }}>{formatDate(log.performed_at)}</td>
          <td>
            <OperationBadge type={log.operation_type} custom={log.custom_operation_label} />
          </td>
          <td style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
            {log.component_label ?? "—"}
          </td>
          <td><OutcomeBadge outcome={log.outcome} /></td>
          <td style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            {log.technician_name}
          </td>
          <td style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            {log.duration_minutes ? `${log.duration_minutes} min` : "—"}
          </td>
          <td style={{ textAlign: "right" }}>
            <Link href={`/islands/${islandId}/logs/${log.id}`} className="btn btn-secondary btn-sm">
              Dettagli
            </Link>
          </td>
        </tr>
      )}
    />
  );
}

function OperationBadge({ type, custom }: { type: string; custom: string | null }) {
  const isEmergency = type === "EMERGENCY_REPAIR";
  const isRevamping = type === "REVAMPING";
  const label = type === "OTHER" && custom ? custom : type.replace(/_/g, " ");
  return (
    <span className={`badge ${isEmergency ? "badge-red" : isRevamping ? "badge-orange" : "badge-blue"}`}
      style={{ fontSize: 11 }}>
      {label}
    </span>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const map: Record<string, string> = {
    COMPLETED: "badge-green",
    PARTIAL: "badge-orange",
    DEFERRED: "badge-red",
    REQUIRES_PARTS: "badge-red",
  };
  const labels: Record<string, string> = {
    COMPLETED: "Completato",
    PARTIAL: "Parziale",
    DEFERRED: "Rimandato",
    REQUIRES_PARTS: "Attende ricambi",
  };
  return (
    <span className={`badge ${map[outcome] ?? "badge-blue"}`} style={{ fontSize: 11 }}>
      {labels[outcome] ?? outcome}
    </span>
  );
}
