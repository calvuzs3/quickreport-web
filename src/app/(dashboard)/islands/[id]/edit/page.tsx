import { getIsland } from "@/lib/api";
import { notFound } from "next/navigation";
import IslandEditForm from "./IslandEditForm";

export default async function IslandEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let island;
  try { island = await getIsland(id); } catch { notFound(); }
  if (island.is_deleted) notFound();
  return <IslandEditForm island={island} />;
}