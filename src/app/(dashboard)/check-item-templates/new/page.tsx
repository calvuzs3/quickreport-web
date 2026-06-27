import { getModuleTypes, getCriticalityLevels } from "@/lib/api";
import CheckItemTemplateEditForm from "../[id]/edit/CheckItemTemplateEditForm";

export default async function NewCheckItemTemplatePage() {
  const [mRes, cRes] = await Promise.all([
    getModuleTypes(false),
    getCriticalityLevels(false),
  ]);
  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Nuovo template voce checkup</h1>
      <CheckItemTemplateEditForm moduleTypes={mRes.data} criticalityLevels={cRes.data} />
    </div>
  );
}
