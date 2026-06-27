"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CriticalityLevel } from "@/types";

export default function ToggleActiveButton({ level }: { level: CriticalityLevel }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      const res = level.is_active
        ? await fetch(`/api/criticality-levels/${level.id}`, { method: "DELETE" })
        : await fetch(`/api/criticality-levels/${level.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...level, is_active: true, updated_at: Date.now() }),
          });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      className={`btn btn-sm ${level.is_active ? "btn-danger" : "btn-secondary"}`}
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? "…" : level.is_active ? "Disattiva" : "Riattiva"}
    </button>
  );
}
