import { getCriticalityLevels } from "@/lib/api";
import Link from "next/link";
import type { CriticalityLevel } from "@/types";
import ToggleActiveButton from "./ToggleActiveButton";

export default async function CriticalityLevelsPage() {
  let levels: CriticalityLevel[] = [];
  let error: string | null = null;

  try {
    const res = await getCriticalityLevels(true);
    levels = res.data.filter(l => !l.is_deleted).sort((a, b) => b.priority - a.priority);
  } catch (e) {
    error = e instanceof Error ? e.message : "Errore caricamento livelli criticità";
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Livelli criticità</h1>
          <p className="page-subtitle">{levels.length} livelli definiti</p>
        </div>
        <Link href="/criticality-levels/new" className="btn btn-primary">+ Nuovo livello</Link>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Codice</th>
              <th>Nome</th>
              <th>Colore</th>
              <th>Priorità</th>
              <th>Stato</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {levels.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--color-text-muted)", padding: 32 }}>
                  Nessun livello criticità trovato
                </td>
              </tr>
            )}
            {levels.map(level => (
              <tr key={level.id}>
                <td style={{ fontFamily: "monospace", fontSize: 13 }}>{level.code}</td>
                <td style={{ fontWeight: 500 }}>
                  {level.icon_emoji && <span style={{ marginRight: 6 }}>{level.icon_emoji}</span>}
                  {level.label}
                </td>
                <td>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontFamily: "monospace", fontSize: 13,
                  }}>
                    <span style={{
                      display: "inline-block", width: 14, height: 14, borderRadius: 3,
                      background: level.color_hex, border: "1px solid rgba(0,0,0,.15)",
                    }} />
                    {level.color_hex}
                  </span>
                </td>
                <td>{level.priority}</td>
                <td>
                  <span className={`badge ${level.is_active ? "badge-green" : "badge-red"}`}>
                    {level.is_active ? "Attivo" : "Inattivo"}
                  </span>
                </td>
                <td style={{ textAlign: "right", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <Link href={`/criticality-levels/${level.id}/edit`} className="btn btn-secondary btn-sm">Modifica</Link>
                  <ToggleActiveButton level={level} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
