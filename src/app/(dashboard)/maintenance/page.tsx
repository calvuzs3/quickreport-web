import { getIslands, getMaintenanceLogs } from "@/lib/api";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { MaintenanceLog, FacilityIsland } from "@/types";

// ─── Health summary computed server-side ─────────────────────────────────────

interface IslandHealth {
  island: FacilityIsland;
  totalLogs: number;
  lastLogDate: number | null;
  lastOutcome: string | null;
  emergencyRate: number;
  deferredRate: number;
  avgDurationMinutes: number | null;
  predictedNextDate: number | null;
  mostFrequentType: string | null;
}

function computeHealth(island: FacilityIsland, logs: MaintenanceLog[]): IslandHealth {
  if (logs.length === 0) {
    return {
      island, totalLogs: 0, lastLogDate: null, lastOutcome: null,
      emergencyRate: 0, deferredRate: 0, avgDurationMinutes: null,
      predictedNextDate: null, mostFrequentType: null,
    };
  }

  const sorted = [...logs].sort((a, b) => b.performed_at - a.performed_at);
  const last = sorted[0];

  // Emergency and deferred rates
  const emergencyRate = logs.filter(l => l.operation_type === "EMERGENCY_REPAIR").length / logs.length;
  const deferredRate = logs.filter(l =>
    l.outcome === "DEFERRED" || l.outcome === "REQUIRES_PARTS"
  ).length / logs.length;

  // Average duration
  const withDuration = logs.filter(l => l.duration_minutes);
  const avgDurationMinutes = withDuration.length > 0
    ? withDuration.reduce((s, l) => s + (l.duration_minutes ?? 0), 0) / withDuration.length
    : null;

  // Average days between interventions → predict next
  let predictedNextDate: number | null = null;
  if (sorted.length >= 2) {
    const intervals: number[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      intervals.push(sorted[i].performed_at - sorted[i + 1].performed_at);
    }
    const avgMs = intervals.reduce((s, v) => s + v, 0) / intervals.length;
    predictedNextDate = last.performed_at + avgMs;
  }

  // Most frequent operation type
  const typeCounts: Record<string, number> = {};
  logs.forEach(l => { typeCounts[l.operation_type] = (typeCounts[l.operation_type] ?? 0) + 1; });
  const mostFrequentType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    island, totalLogs: logs.length,
    lastLogDate: last.performed_at, lastOutcome: last.outcome,
    emergencyRate, deferredRate, avgDurationMinutes,
    predictedNextDate, mostFrequentType,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MaintenancePage() {
  let summaries: IslandHealth[] = [];
  let error: string | null = null;
  let totalLogs = 0;

  try {
    const islandsRes = await getIslands();
    const activeIslands = islandsRes.data.filter(i => !i.is_deleted);

    const allLogsRes = await getMaintenanceLogs();
    const allLogs = allLogsRes.data.filter((l: MaintenanceLog) => !l.is_deleted);
    totalLogs = allLogs.length;

    summaries = activeIslands.map(island => {
      const islandLogs = allLogs.filter((l: MaintenanceLog) => l.island_id === island.id);
      return computeHealth(island, islandLogs);
    });

    // Sort: islands with most recent activity first, then no-activity last
    summaries.sort((a, b) => {
      if (!a.lastLogDate && !b.lastLogDate) return 0;
      if (!a.lastLogDate) return 1;
      if (!b.lastLogDate) return -1;
      return b.lastLogDate - a.lastLogDate;
    });
  } catch (e) {
    error = e instanceof Error ? e.message : "Errore caricamento dati";
  }

  const islandsWithLogs = summaries.filter(s => s.totalLogs > 0).length;
  const totalEmergencies = summaries.reduce((s, h) =>
    s + Math.round(h.emergencyRate * h.totalLogs), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Riepilogo interventi</h1>
          <p className="page-subtitle">
            {totalLogs} interventi su {islandsWithLogs} isole
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Global stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: 16, marginBottom: 28,
      }}>
        <StatCard label="Interventi totali" value={totalLogs} color="var(--color-primary)" />
        <StatCard label="Isole monitorate" value={islandsWithLogs} color="#7c3aed" />
        <StatCard label="Emergenze totali" value={totalEmergencies} color="var(--color-danger)" />
        <StatCard
          label="Isole senza log"
          value={summaries.length - islandsWithLogs}
          color="var(--color-text-muted)"
        />
      </div>

      {/* Per-island health cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {summaries.map(h => (
          <IslandHealthCard key={h.island.id} health={h} />
        ))}
        {summaries.length === 0 && (
          <div className="card" style={{ textAlign: "center", color: "var(--color-text-muted)", padding: 40 }}>
            Nessuna isola attiva trovata
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Components ───────────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card" style={{ borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>{label}</div>
    </div>
  );
}

const OP_LABELS: Record<string, string> = {
  ROUTINE_INSPECTION: "Ispezione", OIL_CHANGE: "Cambio olio",
  FILTER_REPLACEMENT: "Filtro", LUBRICATION: "Lubrificazione",
  CALIBRATION: "Calibrazione", COMPONENT_REPLACEMENT: "Sostituzione",
  ENCODER_REPLACEMENT: "Encoder", MOTOR_REPLACEMENT: "Motore",
  REDUCER_REPLACEMENT: "Riduttore", SENSOR_REPLACEMENT: "Sensore",
  CABLE_REPLACEMENT: "Cavo", ELECTRICAL_REPAIR: "Elettrico",
  SOFTWARE_UPDATE: "Software", PARAMETER_TUNING: "Parametri",
  EMERGENCY_REPAIR: "Emergenza", REVAMPING: "Revamping",
  INSTALLATION: "Installazione", OTHER: "Altro",
};

function IslandHealthCard({ health: h }: { health: IslandHealth }) {
  const emergencyPct = Math.round(h.emergencyRate * 100);
  const deferredPct = Math.round(h.deferredRate * 100);
  const healthScore = Math.max(0, 100 - emergencyPct * 2 - deferredPct);

  const scoreColor = healthScore >= 80
    ? "var(--color-success)"
    : healthScore >= 50
    ? "var(--color-warning)"
    : "var(--color-danger)";

  const now = Date.now();
  const isOverdue = h.predictedNextDate && h.predictedNextDate < now;

  return (
    <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "start" }}>
      <div>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <Link href={`/islands/${h.island.id}`} style={{ fontWeight: 600, fontSize: 15, color: "var(--color-text)" }}>
            {h.island.custom_name ?? h.island.serial_number}
          </Link>
          <span className="badge badge-blue" style={{ fontSize: 10 }}>{h.island.island_type}</span>
          <span className={`badge ${h.island.is_active ? "badge-green" : "badge-red"}`} style={{ fontSize: 10 }}>
            {h.island.is_active ? "Attiva" : "Inattiva"}
          </span>
          {h.totalLogs === 0 && (
            <span className="badge badge-red" style={{ fontSize: 10 }}>Nessun log</span>
          )}
        </div>

        {h.totalLogs === 0 ? (
          <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            Nessun intervento registrato per questa isola.
          </p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            <Metric label="Interventi" value={String(h.totalLogs)} />
            <Metric label="Ultimo" value={formatDate(h.lastLogDate)} />
            <Metric
              label="Prossimo stimato"
              value={h.predictedNextDate ? formatDate(h.predictedNextDate) : "N/D"}
              alert={!!isOverdue}
            />
            <Metric
              label="Tasso emergenze"
              value={`${emergencyPct}%`}
              alert={emergencyPct > 20}
            />
            <Metric
              label="Tasso rinvii"
              value={`${deferredPct}%`}
              alert={deferredPct > 20}
            />
            {h.avgDurationMinutes && (
              <Metric label="Durata media" value={`${Math.round(h.avgDurationMinutes)} min`} />
            )}
            {h.mostFrequentType && (
              <Metric label="Op. più frequente" value={OP_LABELS[h.mostFrequentType] ?? h.mostFrequentType} />
            )}
          </div>
        )}
      </div>

      {/* Health score */}
      {h.totalLogs > 0 && (
        <div style={{ textAlign: "center", minWidth: 72 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            border: `4px solid ${scoreColor}`,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: scoreColor }}>{healthScore}</span>
            <span style={{ fontSize: 9, color: "var(--color-text-muted)" }}>SCORE</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 4 }}>
            {healthScore >= 80 ? "Buono" : healthScore >= 50 ? "Attenzione" : "Critico"}
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: alert ? "var(--color-danger)" : "var(--color-text)" }}>
        {value}
      </div>
    </div>
  );
}