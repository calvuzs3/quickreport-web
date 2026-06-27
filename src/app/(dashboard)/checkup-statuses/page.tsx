import { getCheckupStatuses } from "@/lib/api";
import Link from "next/link";
import type { CheckupStatus } from "@/types";
import ToggleActiveButton from "./ToggleActiveButton";

export default async function CheckupStatusesPage() {
  let statuses: CheckupStatus[] = [];
  let error: string | null = null;

  try {
    const res = await getCheckupStatuses(true);
    statuses = res.data.filter(s => !s.is_deleted).sort((a, b) => a.sort_order - b.sort_order);
  } catch (e) {
    error = e instanceof Error ? e.message : "Errore caricamento stati checkup";
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stati checkup</h1>
          <p className="page-subtitle">{statuses.length} stati definiti</p>
        </div>
        <Link href="/checkup-statuses/new" className="btn btn-primary">+ Nuovo stato</Link>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Codice</th>
              <th>Nome</th>
              <th>Colore</th>
              <th>Flags</th>
              <th>Stato</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {statuses.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--color-text-muted)", padding: 32 }}>
                  Nessuno stato checkup trovato
                </td>
              </tr>
            )}
            {statuses.map(s => (
              <tr key={s.id}>
                <td style={{ fontFamily: "monospace", fontSize: 13 }}>{s.code}</td>
                <td style={{ fontWeight: 500 }}>
                  {s.icon_emoji && <span style={{ marginRight: 6 }}>{s.icon_emoji}</span>}
                  {s.label}
                </td>
                <td>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "monospace", fontSize: 13 }}>
                    <span style={{
                      display: "inline-block", width: 14, height: 14, borderRadius: 3,
                      background: s.color_hex, border: "1px solid rgba(0,0,0,.15)",
                    }} />
                    {s.color_hex}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                  {s.marks_completion && <span className="badge badge-green" style={{ marginRight: 4 }}>Completamento</span>}
                  {s.blocks_deletion && <span className="badge badge-red">Blocca elimina</span>}
                  {!s.marks_completion && !s.blocks_deletion && "—"}
                </td>
                <td>
                  <span className={`badge ${s.is_active ? "badge-green" : "badge-red"}`}>
                    {s.is_active ? "Attivo" : "Inattivo"}
                  </span>
                </td>
                <td style={{ textAlign: "right", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <Link href={`/checkup-statuses/${s.id}/edit`} className="btn btn-secondary btn-sm">Modifica</Link>
                  <ToggleActiveButton status={s} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
