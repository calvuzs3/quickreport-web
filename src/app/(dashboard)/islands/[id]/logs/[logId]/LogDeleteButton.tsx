"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogDeleteButton({ id, islandId }: { id: string; islandId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/maintenance-logs/${id}`, { method: "DELETE" });
      if (res.ok) { router.push(`/islands/${islandId}`); router.refresh(); }
    } finally { setLoading(false); setConfirming(false); }
  }

  if (confirming) return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Eliminare questo log?</span>
      <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={loading}>
        {loading ? "…" : "Conferma"}
      </button>
      <button className="btn btn-secondary btn-sm" onClick={() => setConfirming(false)}>Annulla</button>
    </div>
  );
  return <button className="btn btn-danger btn-sm" onClick={() => setConfirming(true)}>Elimina log</button>;
}