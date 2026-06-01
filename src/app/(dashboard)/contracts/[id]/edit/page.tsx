import { getContract } from "@/lib/api";
import { notFound } from "next/navigation";
import ContractEditForm from "./ContractEditForm";

export default async function ContractEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let contract;
  try { contract = await getContract(id); } catch { notFound(); }
  if (contract.is_deleted) notFound();
  return <ContractEditForm contract={contract} />;
}