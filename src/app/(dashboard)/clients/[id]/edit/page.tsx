import { getClient } from "@/lib/api";
import { notFound } from "next/navigation";
import ClientEditForm from "./ClientEditForm";

export default async function ClientEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let client;
  try { client = await getClient(id); } catch { notFound(); }
  if (client.is_deleted) notFound();
  return <ClientEditForm client={client} />;
}