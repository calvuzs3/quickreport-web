import { getModuleType } from "@/lib/api";
import ModuleTypeEditForm from "./ModuleTypeEditForm";

export default async function EditModuleTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const type = await getModuleType(id);
  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Modifica tipo modulo</h1>
      <ModuleTypeEditForm initial={type} />
    </div>
  );
}
