import { getCriticalityLevel } from "@/lib/api";
import CriticalityLevelEditForm from "./CriticalityLevelEditForm";

export default async function EditCriticalityLevelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const level = await getCriticalityLevel(id);
  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Modifica livello criticità</h1>
      <CriticalityLevelEditForm initial={level} />
    </div>
  );
}
