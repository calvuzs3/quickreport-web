import { getCheckItemTemplate, getModuleTypes, getCriticalityLevels } from "@/lib/api";
import CheckItemTemplateEditForm from "./CheckItemTemplateEditForm";

export default async function EditCheckItemTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [template, mRes, cRes] = await Promise.all([
    getCheckItemTemplate(id),
    getModuleTypes(false),
    getCriticalityLevels(false),
  ]);
  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Modifica template voce checkup</h1>
      <CheckItemTemplateEditForm
        initial={template}
        moduleTypes={mRes.data}
        criticalityLevels={cRes.data}
      />
    </div>
  );
}
