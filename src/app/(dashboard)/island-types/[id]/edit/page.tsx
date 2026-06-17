import { getIslandType } from "@/lib/api";
import { notFound } from "next/navigation";
import IslandTypeEditForm from "./IslandTypeEditForm";

export default async function IslandTypeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let type;
  try { type = await getIslandType(id); } catch { notFound(); }
  if (type.is_deleted) notFound();
  return <IslandTypeEditForm type={type} />;
}
