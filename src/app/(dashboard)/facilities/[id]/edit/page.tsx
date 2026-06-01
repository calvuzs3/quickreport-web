import { getFacility } from "@/lib/api";
import { notFound } from "next/navigation";
import FacilityEditForm from "./FacilityEditForm";

export default async function FacilityEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let facility;
  try { facility = await getFacility(id); } catch { notFound(); }
  if (facility.is_deleted) notFound();
  return <FacilityEditForm facility={facility} />;
}