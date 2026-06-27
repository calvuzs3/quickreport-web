import { getCheckItemTemplates, getModuleTypes, getCriticalityLevels } from "@/lib/api";
import Link from "next/link";
import type { CheckItemTemplate, ModuleType, CriticalityLevel } from "@/types";
import DeleteButton from "./DeleteButton";

export default async function CheckItemTemplatesPage() {
  let templates: CheckItemTemplate[] = [];
  let moduleTypes: ModuleType[] = [];
  let criticalityLevels: CriticalityLevel[] = [];
  let error: string | null = null;

  try {
    const [tRes, mRes, cRes] = await Promise.all([
      getCheckItemTemplates(),
      getModuleTypes(false),
      getCriticalityLevels(false),
    ]);
    templates = tRes.data.filter(t => !t.is_deleted).sort((a, b) => a.order_index - b.order_index);
    moduleTypes = mRes.data;
    criticalityLevels = cRes.data;
  } catch (e) {
    error = e instanceof Error ? e.message : "Errore caricamento template";
  }

  const moduleMap = Object.fromEntries(moduleTypes.map(m => [m.id, m]));
  const critMap = Object.fromEntries(criticalityLevels.map(c => [c.id, c]));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Template voci checkup</h1>
          <p className="page-subtitle">{templates.length} template definiti</p>
        </div>
        <Link href="/check-item-templates/new" className="btn btn-primary">+ Nuovo template</Link>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Modulo</th>
              <th>Categoria</th>
              <th>Descrizione</th>
              <th>Criticità</th>
              <th>Ordine</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {templates.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--color-text-muted)", padding: 32 }}>
                  Nessun template trovato
                </td>
              </tr>
            )}
            {templates.map(t => {
              const mod = moduleMap[t.module_type_id];
              const crit = critMap[t.criticality_id];
              return (
                <tr key={t.id}>
                  <td>
                    <span className="badge badge-blue">{mod?.label ?? t.module_type_id}</span>
                  </td>
                  <td style={{ color: "var(--color-text-muted)", fontSize: 13 }}>{t.category || "—"}</td>
                  <td style={{ fontWeight: 500, maxWidth: 320 }}>
                    <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.description}
                    </span>
                  </td>
                  <td>
                    {crit ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                        <span style={{
                          display: "inline-block", width: 10, height: 10, borderRadius: 2,
                          background: crit.color_hex,
                        }} />
                        {crit.label}
                      </span>
                    ) : t.criticality_id}
                  </td>
                  <td>{t.order_index}</td>
                  <td style={{ textAlign: "right", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <Link href={`/check-item-templates/${t.id}/edit`} className="btn btn-secondary btn-sm">Modifica</Link>
                    <DeleteButton id={t.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
