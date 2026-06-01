"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/facilities/${id}`, { method: "DELETE" });
      if (res.ok) { router.push("/facilities"); router.refresh(); }
    } finally { setLoading(false); setConfirming(false); }
  }

  if (confirming) return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Eliminare &quot;{name}&quot;?</span>
      <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={loading}>{loading ? "…" : "Conferma"}</button>
      <button className="btn btn-secondary btn-sm" onClick={() => setConfirming(false)}>Annulla</button>
    </div>
  );
  return <button className="btn btn-danger" onClick={() => setConfirming(true)}>Elimina</button>;
}