"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CheckupStatus } from "@/types";

export default function ToggleActiveButton({ status }: { status: CheckupStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      const res = status.is_active
        ? await fetch(`/api/checkup-statuses/${status.id}`, { method: "DELETE" })
        : await fetch(`/api/checkup-statuses/${status.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...status, is_active: true, updated_at: Date.now() }),
          });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      className={`btn btn-sm ${status.is_active ? "btn-danger" : "btn-secondary"}`}
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? "…" : status.is_active ? "Disattiva" : "Riattiva"}
    </button>
  );
}
