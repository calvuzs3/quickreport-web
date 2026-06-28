"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DisableButton({ id, username }: { id: string; username: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDisable() {
    if (!confirm(`Disattivare l'utente "${username}"? Non potrà più accedere al sistema.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? `Errore ${res.status}`);
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className="btn btn-danger btn-sm" onClick={handleDisable} disabled={loading}>
      {loading ? "…" : "Disattiva"}
    </button>
  );
}
