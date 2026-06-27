import { getCheckupStatus } from "@/lib/api";
import CheckupStatusEditForm from "./CheckupStatusEditForm";

export default async function EditCheckupStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const status = await getCheckupStatus(id);
  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Modifica stato checkup</h1>
      <CheckupStatusEditForm initial={status} />
    </div>
  );
}
