"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { IslandType } from "@/types";

export default function ToggleActiveButton({ type }: { type: IslandType }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      // DELETE soft-deactivates server-side; restoring needs a full upsert (PUT),
      // since the backend upsert expects the complete record, not a partial patch.
      const res = type.is_active
        ? await fetch(`/api/island-types/${type.id}`, { method: "DELETE" })
        : await fetch(`/api/island-types/${type.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...type, is_active: true, updated_at: Date.now() }),
          });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      className={`btn btn-sm ${type.is_active ? "btn-danger" : "btn-secondary"}`}
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? "…" : type.is_active ? "Disattiva" : "Riattiva"}
    </button>
  );
}
