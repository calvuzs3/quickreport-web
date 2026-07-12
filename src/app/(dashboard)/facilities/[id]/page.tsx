import { getFacility, getIslands, getClient } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, formatDateTime } from "@/lib/utils";
import { parseAddress, formatAddress, googleMapsUrl } from "@/lib/address";
import DeleteButton from "./DeleteButton";

export default async function FacilityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let facility, islands, client;
  try {
    facility = await getFacility(id);
    [islands, client] = await Promise.all([
      getIslands(id),
      getClient(facility.client_id).catch(() => null),
    ]);
  } catch { notFound(); }
  if (facility.is_deleted) notFound();

  const address = parseAddress(facility.address_json);

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/facilities" style={{ color: "var(--color-text-muted)", fontSize: 13 }}>← Stabilimenti</Link>
          <h1 className="page-title">{facility.name}</h1>
          <p className="page-subtitle" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="badge badge-blue">{facility.facility_type}</span>
            <span className={`badge ${facility.is_active ? "badge-green" : "badge-red"}`}>
              {facility.is_active ? "Attivo" : "Inattivo"}
            </span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/facilities/${id}/edit`} className="btn btn-secondary">Modifica</Link>
          <DeleteButton id={id} name={facility.name} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Informazioni</h2>
          <dl style={{ display: "grid", gap: 10 }}>
            <InfoRow label="Codice" value={facility.code} />
            <InfoRow label="Tipo" value={facility.facility_type} />
            <InfoRow label="Primario" value={facility.is_primary ? "Sì" : "No"} />
            <InfoRow label="Indirizzo" value={formatAddress(address)} />
            <InfoRow label="Note" value={facility.notes} />
            <InfoRow label="Creato" value={formatDate(facility.created_at)} />
            <InfoRow label="Ultima modifica" value={formatDateTime(facility.updated_at)} />
          </dl>
          {address?.coordinates && (
            <a href={googleMapsUrl(address.coordinates)} target="_blank" rel="noopener noreferrer"
              className="btn btn-secondary btn-sm" style={{ marginTop: 12 }}>
              🔗 Apri in Google Maps
            </a>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Cliente</h2>
          {client ? (
            <Link href={`/clients/${facility.client_id}`} style={{
              display: "block", padding: "10px 12px",
              border: "1px solid var(--color-border)", borderRadius: "var(--radius)", color: "inherit",
            }}>
              <div style={{ fontWeight: 500 }}>{client.company_name}</div>
            </Link>
          ) : (
            <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Cliente non trovato</p>
          )}
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600 }}>
            Isole robotizzate ({islands.data.filter(i => !i.is_deleted).length})
          </h2>
          <Link href={`/islands/new?facilityId=${id}`} className="btn btn-secondary btn-sm">+ Aggiungi isola</Link>
        </div>
        <table><thead><tr><th>Nome / Seriale</th><th>Tipo</th><th>N° Commessa</th><th>Ore</th><th>Stato</th><th></th></tr></thead>
          <tbody>
            {islands.data.filter(i => !i.is_deleted).map(island => (
              <tr key={island.id}>
                <td style={{ fontWeight: 500 }}>{island.custom_name ?? island.serial_number}</td>
                <td><span className="badge badge-blue">{island.island_type}</span></td>
                <td style={{ color: "var(--color-text-muted)" }}>{island.commissioning_number ?? "—"}</td>
                <td style={{ color: "var(--color-text-muted)" }}>{island.operating_hours.toLocaleString("it-IT")} h</td>
                <td><span className={`badge ${island.is_active ? "badge-green" : "badge-red"}`}>
                  {island.is_active ? "Attiva" : "Inattiva"}
                </span></td>
                <td style={{ textAlign: "right" }}>
                  <Link href={`/islands/${island.id}`} className="btn btn-secondary btn-sm">Dettagli</Link>
                </td>
              </tr>
            ))}
            {islands.data.filter(i => !i.is_deleted).length === 0 && (
              <tr><td colSpan={6} style={{ color: "var(--color-text-muted)", padding: 24 }}>Nessuna isola</td></tr>
            )}
          </tbody>
        </table>
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