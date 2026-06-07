"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { generateId } from "@/lib/utils";
import type { MechanicalUnit } from "@/types";
import { OPERATION_TYPES, OUTCOMES } from "@/types";

const OP_LABELS: Record<string, string> = {
  ROUTINE_INSPECTION: "Ispezione routinaria",
  OIL_CHANGE: "Cambio olio",
  FILTER_REPLACEMENT: "Sostituzione filtro",
  LUBRICATION: "Lubrificazione",
  CALIBRATION: "Calibrazione",
  COMPONENT_REPLACEMENT: "Sostituzione componente",
  ENCODER_REPLACEMENT: "Sostituzione encoder",
  MOTOR_REPLACEMENT: "Sostituzione motore",
  REDUCER_REPLACEMENT: "Sostituzione riduttore",
  SENSOR_REPLACEMENT: "Sostituzione sensore",
  CABLE_REPLACEMENT: "Sostituzione cavo",
  ELECTRICAL_REPAIR: "Riparazione elettrica",
  SOFTWARE_UPDATE: "Aggiornamento software",
  PARAMETER_TUNING: "Taratura parametri",
  EMERGENCY_REPAIR: "Riparazione emergenza",
  REVAMPING: "Revamping",
  INSTALLATION: "Installazione",
  OTHER: "Altro",
};

const OUTCOME_LABELS: Record<string, string> = {
  COMPLETED: "Completato",
  PARTIAL: "Parziale",
  DEFERRED: "Rimandato",
  REQUIRES_PARTS: "Attende ricambi",
};

export default function NewMaintenanceLogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [islandId, setIslandId] = useState("");
  const [units, setUnits] = useState<MechanicalUnit[]>([]);
  const [form, setForm] = useState({
    operation_type: "ROUTINE_INSPECTION",
    custom_operation_label: "",
    mechanical_unit_id: "",
    component_label: "",
    description: "",
    technician_name: "",
    technician_company: "",
    outcome: "COMPLETED",
    duration_minutes: "",
    notes: "",
    performed_at: new Date().toISOString().slice(0, 16),
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      setIslandId(id);
      fetch(`/api/mechanical-units?islandId=${id}`)
        .then(r => r.json())
        .then(d => setUnits(d.data.filter((u: MechanicalUnit) => !u.is_deleted && u.is_active)))
        .catch(() => {});
    });
  }, [params]);

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const now = Date.now();
    const payload = {
      id: generateId(),
      island_id: islandId,
      operation_type: form.operation_type,
      custom_operation_label: form.operation_type === "OTHER" ? form.custom_operation_label || null : null,
      mechanical_unit_id: form.mechanical_unit_id || null,
      component_label: !form.mechanical_unit_id && form.component_label ? form.component_label : null,
      description: form.description,
      technician_name: form.technician_name,
      technician_company: form.technician_company || null,
      outcome: form.outcome,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      notes: form.notes || null,
      performed_at: new Date(form.performed_at).getTime(),
      created_at: now,
      updated_at: now,
      synced_at: null,
      is_active: true,
      is_deleted: false,
    };
    try {
      const res = await fetch("/api/maintenance-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Errore durante la creazione");
        return;
      }
      router.push(`/islands/${islandId}`);
      router.refresh();
    } catch { setError("Errore di connessione"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href={`/islands/${islandId}`} style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
            ← Isola
          </Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>Nuovo intervento</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 680 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && <div className="alert alert-error">{error}</div>}

          {/* Operation */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Tipo operazione *</label>
              <select className="form-select" value={form.operation_type}
                onChange={e => set("operation_type", e.target.value)}>
                {OPERATION_TYPES.map(t => (
                  <option key={t} value={t}>{OP_LABELS[t] ?? t}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Data e ora intervento *</label>
              <input className="form-input" type="datetime-local" value={form.performed_at}
                onChange={e => set("performed_at", e.target.value)} required />
            </div>
          </div>

          {form.operation_type === "OTHER" && (
            <div className="form-group">
              <label className="form-label">Descrizione operazione *</label>
              <input className="form-input" type="text" value={form.custom_operation_label}
                onChange={e => set("custom_operation_label", e.target.value)}
                placeholder="Descrivi il tipo di intervento" required />
            </div>
          )}

          {/* Component */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Unità meccanica</label>
              <select className="form-select" value={form.mechanical_unit_id}
                onChange={e => set("mechanical_unit_id", e.target.value)}>
                <option value="">— Nessuna unità catalogata —</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.unit_type})</option>
                ))}
              </select>
            </div>
            {!form.mechanical_unit_id && (
              <div className="form-group">
                <label className="form-label">Componente (testo libero)</label>
                <input className="form-input" type="text" value={form.component_label}
                  onChange={e => set("component_label", e.target.value)}
                  placeholder="es. Asse J2, Riduttore" />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Descrizione intervento *</label>
            <textarea className="form-textarea" value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Descrivi cosa è stato fatto" required />
          </div>

          {/* Technician */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Nome tecnico *</label>
              <input className="form-input" type="text" value={form.technician_name}
                onChange={e => set("technician_name", e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Azienda tecnico</label>
              <input className="form-input" type="text" value={form.technician_company}
                onChange={e => set("technician_company", e.target.value)} />
            </div>
          </div>

          {/* Outcome */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Esito *</label>
              <select className="form-select" value={form.outcome}
                onChange={e => set("outcome", e.target.value)}>
                {OUTCOMES.map(o => (
                  <option key={o} value={o}>{OUTCOME_LABELS[o] ?? o}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Durata (minuti)</label>
              <input className="form-input" type="number" min={1} value={form.duration_minutes}
                onChange={e => set("duration_minutes", e.target.value)} />
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Note aggiuntive</label>
            <textarea className="form-textarea" value={form.notes}
              onChange={e => set("notes", e.target.value)} />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Salvataggio…" : "Registra intervento"}
            </button>
            <Link href={`/islands/${islandId}`} className="btn btn-secondary">Annulla</Link>
          </div>
        </form>
      </div>
    </div>
  );
}