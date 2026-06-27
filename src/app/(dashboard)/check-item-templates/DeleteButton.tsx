"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Eliminare questo template?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/check-item-templates/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={loading}>
      {loading ? "…" : "Elimina"}
    </button>
  );
}
