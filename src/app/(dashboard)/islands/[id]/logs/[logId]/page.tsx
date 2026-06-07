import { getMaintenanceLog, getIsland } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, formatDateTime } from "@/lib/utils";
import LogDeleteButton from "./LogDeleteButton";

const OP_LABELS: Record<string, string> = {
  ROUTINE_INSPECTION: "Ispezione routinaria", OIL_CHANGE: "Cambio olio",
  FILTER_REPLACEMENT: "Sostituzione filtro", LUBRICATION: "Lubrificazione",
  CALIBRATION: "Calibrazione", COMPONENT_REPLACEMENT: "Sostituzione componente",
  ENCODER_REPLACEMENT: "Sostituzione encoder", MOTOR_REPLACEMENT: "Sostituzione motore",
  REDUCER_REPLACEMENT: "Sostituzione riduttore", SENSOR_REPLACEMENT: "Sostituzione sensore",
  CABLE_REPLACEMENT: "Sostituzione cavo", ELECTRICAL_REPAIR: "Riparazione elettrica",
  SOFTWARE_UPDATE: "Aggiornamento software", PARAMETER_TUNING: "Taratura parametri",
  EMERGENCY_REPAIR: "Riparazione emergenza", REVAMPING: "Revamping",
  INSTALLATION: "Installazione", OTHER: "Altro",
};

const OUTCOME_LABELS: Record<string, string> = {
  COMPLETED: "Completato", PARTIAL: "Parziale",
  DEFERRED: "Rimandato", REQUIRES_PARTS: "Attende ricambi",
};

export default async function MaintenanceLogDetailPage({
  params,
}: {
  params: Promise<{ id: string; logId: string }>;
}) {
  const { id, logId } = await params;
  let log, island;
  try {
    [log, island] = await Promise.all([getMaintenanceLog(logId), getIsland(id)]);
  } catch { notFound(); }
  if (log.is_deleted) notFound();

  const opLabel = log.operation_type === "OTHER" && log.custom_operation_label
    ? log.custom_operation_label
    : OP_LABELS[log.operation_type] ?? log.operation_type;

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, fontSize: 13, color: "var(--color-text-muted)" }}>
            <Link href="/islands" style={{ color: "var(--color-text-muted)" }}>Isole</Link>
            <span>/</span>
            <Link href={`/islands/${id}`} style={{ color: "var(--color-text-muted)" }}>
              {island.custom_name ?? island.serial_number}
            </Link>
          </div>
          <h1 className="page-title">{opLabel}</h1>
          <p className="page-subtitle" style={{ display: "flex", gap: 8 }}>
            <span className="badge badge-blue">{formatDate(log.performed_at)}</span>
            <OutcomeBadge outcome={log.outcome} />
          </p>
        </div>
        <LogDeleteButton id={logId} islandId={id} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Dettagli intervento</h2>
          <dl style={{ display: "grid", gap: 10 }}>
            <InfoRow label="Tipo operazione" value={opLabel} />
            <InfoRow label="Data intervento" value={formatDateTime(log.performed_at)} />
            <InfoRow label="Esito" value={OUTCOME_LABELS[log.outcome] ?? log.outcome} />
            <InfoRow label="Durata" value={log.duration_minutes ? `${log.duration_minutes} min` : null} />
            <InfoRow label="Componente" value={log.component_label} />
          </dl>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Tecnico</h2>
          <dl style={{ display: "grid", gap: 10 }}>
            <InfoRow label="Nome" value={log.technician_name} />
            <InfoRow label="Azienda" value={log.technician_company} />
          </dl>

          <h2 style={{ fontSize: 14, fontWeight: 600, margin: "16px 0 12px" }}>Stato macchina</h2>
          <dl style={{ display: "grid", gap: 10 }}>
            <InfoRow label="Ore operative" value={log.operating_hours_at_event ? `${log.operating_hours_at_event.toLocaleString("it-IT")} h` : null} />
            <InfoRow label="Cicli" value={log.cycle_count_at_event ? log.cycle_count_at_event.toLocaleString("it-IT") : null} />
          </dl>
        </div>

        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Descrizione</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7 }}>{log.description}</p>
          {log.notes && (
            <>
              <h2 style={{ fontSize: 14, fontWeight: 600, margin: "16px 0 8px" }}>Note</h2>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--color-text-muted)" }}>{log.notes}</p>
            </>
          )}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-border)", fontSize: 12, color: "var(--color-text-muted)" }}>
            Registrato il {formatDateTime(log.created_at)} · Ultima modifica {formatDateTime(log.updated_at)}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <dt style={{ fontSize: 12, color: "var(--color-text-muted)", width: 140, flexShrink: 0 }}>{label}</dt>
      <dd style={{ fontSize: 13 }}>{value ?? "—"}</dd>
    </div>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const map: Record<string, string> = {
    COMPLETED: "badge-green", PARTIAL: "badge-orange",
    DEFERRED: "badge-red", REQUIRES_PARTS: "badge-red",
  };
  const labels: Record<string, string> = {
    COMPLETED: "Completato", PARTIAL: "Parziale",
    DEFERRED: "Rimandato", REQUIRES_PARTS: "Attende ricambi",
  };
  return (
    <span className={`badge ${map[outcome] ?? "badge-blue"}`}>
      {labels[outcome] ?? outcome}
    </span>
  );
}