import { getIsland, getFacility, getMechanicalUnits, getClient, getMaintenanceLogs } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, formatDateTime } from "@/lib/utils";
import DeleteButton from "./DeleteButton";
import MaintenanceLogsTable from "./MaintenanceLogsTable";
import type { MaintenanceLog } from "@/types";

export default async function IslandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let island, facility, client, units, logs;
  try {
    island = await getIsland(id);
    [facility, units, logs] = await Promise.all([
      getFacility(island.facility_id),
      getMechanicalUnits(id),
      getMaintenanceLogs(id),
    ]);
    client = await getClient(facility.client_id).catch(() => null);
  } catch { notFound(); }
  if (island.is_deleted) notFound();

  const activeLogs = logs.data.filter((l: MaintenanceLog) => !l.is_deleted);

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, fontSize: 13, color: "var(--color-text-muted)" }}>
            <Link href="/islands" style={{ color: "var(--color-text-muted)" }}>Isole</Link>
            <span>/</span>
            <Link href={`/facilities/${island.facility_id}`} style={{ color: "var(--color-text-muted)" }}>{facility.name}</Link>
          </div>
          <h1 className="page-title">{island.custom_name ?? island.serial_number}</h1>
          <p className="page-subtitle" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="badge badge-blue">{island.island_type}</span>
            <span className={`badge ${island.is_active ? "badge-green" : "badge-red"}`}>
              {island.is_active ? "Attiva" : "Inattiva"}
            </span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/islands/${id}/edit`} className="btn btn-secondary">Modifica</Link>
          <DeleteButton id={id} name={island.custom_name ?? island.serial_number} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Dati tecnici</h2>
          <dl style={{ display: "grid", gap: 10 }}>
            <InfoRow label="Numero seriale" value={island.serial_number} />
            <InfoRow label="N° Commessa" value={island.commissioning_number} />
            <InfoRow label="Modello" value={island.model} />
            <InfoRow label="Posizione" value={island.location} />
            <InfoRow label="Ore operative" value={`${island.operating_hours.toLocaleString("it-IT")} h`} />
            <InfoRow label="Cicli totali" value={island.cycle_count.toLocaleString("it-IT")} />
          </dl>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Manutenzione</h2>
          <dl style={{ display: "grid", gap: 10 }}>
            <InfoRow label="Data installazione" value={formatDate(island.installation_date)} />
            <InfoRow label="Scadenza garanzia" value={formatDate(island.warranty_expiration)} />
            <InfoRow label="Ultima manutenzione" value={formatDate(island.last_maintenance_date)} />
            <InfoRow label="Prossima manutenzione" value={formatDate(island.next_scheduled_maintenance)} />
            <InfoRow label="Creato" value={formatDate(island.created_at)} />
            <InfoRow label="Ultima modifica" value={formatDateTime(island.updated_at)} />
          </dl>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Ubicazione</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {client && (
              <Link href={`/clients/${client.id}`} style={{
                display: "block", padding: "8px 12px",
                border: "1px solid var(--color-border)", borderRadius: "var(--radius)", color: "inherit", fontSize: 13,
              }}>
                <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>CLIENTE</span>
                <div style={{ fontWeight: 500 }}>{client.company_name}</div>
              </Link>
            )}
            <Link href={`/facilities/${facility.id}`} style={{
              display: "block", padding: "8px 12px",
              border: "1px solid var(--color-border)", borderRadius: "var(--radius)", color: "inherit", fontSize: 13,
            }}>
              <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>STABILIMENTO</span>
              <div style={{ fontWeight: 500 }}>{facility.name}</div>
            </Link>
          </div>
        </div>

        {/* Mechanical units */}
        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            Unità meccaniche ({units.data.filter((u: {is_deleted: boolean}) => !u.is_deleted).length})
          </h2>
          <table><thead><tr><th>Nome</th><th>Tipo</th><th>Stato</th></tr></thead>
            <tbody>
              {units.data.filter((u: {is_deleted: boolean}) => !u.is_deleted).map((unit: {id: string; name: string; unit_type: string | null; is_active: boolean}) => (
                <tr key={unit.id}>
                  <td style={{ fontWeight: 500 }}>{unit.name}</td>
                  <td style={{ color: "var(--color-text-muted)" }}>{unit.unit_type ?? "—"}</td>
                  <td><span className={`badge ${unit.is_active ? "badge-green" : "badge-red"}`}>
                    {unit.is_active ? "Attiva" : "Inattiva"}
                  </span></td>
                </tr>
              ))}
              {units.data.filter((u: {is_deleted: boolean}) => !u.is_deleted).length === 0 && (
                <tr><td colSpan={3} style={{ color: "var(--color-text-muted)", padding: 16 }}>Nessuna unità</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance logs */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Log interventi ({activeLogs.length})</h2>
            {activeLogs.length > 0 && (
              <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
                Ultimo: {formatDate(activeLogs[0].performed_at)}
              </p>
            )}
          </div>
          <Link href={`/islands/${id}/logs/new`} className="btn btn-primary btn-sm">
            + Nuovo intervento
          </Link>
        </div>

        <MaintenanceLogsTable islandId={id} logs={activeLogs} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <dt style={{ fontSize: 12, color: "var(--color-text-muted)", width: 160, flexShrink: 0 }}>{label}</dt>
      <dd style={{ fontSize: 13 }}>{value ?? "—"}</dd>
    </div>
  );
}
