import { getModuleTypes } from "@/lib/api";
import Link from "next/link";
import type { ModuleType } from "@/types";
import ToggleActiveButton from "./ToggleActiveButton";

export default async function ModuleTypesPage() {
  let types: ModuleType[] = [];
  let error: string | null = null;

  try {
    const res = await getModuleTypes(true);
    types = res.data.filter(t => !t.is_deleted);
  } catch (e) {
    error = e instanceof Error ? e.message : "Errore caricamento tipi modulo";
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tipi modulo checkup</h1>
          <p className="page-subtitle">{types.length} tipi definiti</p>
        </div>
        <Link href="/module-types/new" className="btn btn-primary">+ Nuovo tipo</Link>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Codice</th>
              <th>Nome</th>
              <th>Descrizione</th>
              <th>Ordine</th>
              <th>Stato</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {types.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--color-text-muted)", padding: 32 }}>
                  Nessun tipo modulo trovato
                </td>
              </tr>
            )}
            {types.map(type => (
              <tr key={type.id}>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{type.code}</td>
                <td style={{ fontWeight: 500 }}>{type.label}</td>
                <td style={{ color: "var(--color-text-muted)" }}>{type.description ?? "—"}</td>
                <td>{type.sort_order}</td>
                <td>
                  <span className={`badge ${type.is_active ? "badge-green" : "badge-red"}`}>
                    {type.is_active ? "Attivo" : "Inattivo"}
                  </span>
                </td>
                <td style={{ textAlign: "right", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <Link href={`/module-types/${type.id}/edit`} className="btn btn-secondary btn-sm">Modifica</Link>
                  <ToggleActiveButton type={type} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
