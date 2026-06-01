import { getContact } from "@/lib/api";
import { notFound } from "next/navigation";
import ContactEditForm from "./ContactEditForm";

export default async function ContactEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let contact;
  try { contact = await getContact(id); } catch { notFound(); }
  if (contact.is_deleted) notFound();
  return <ContactEditForm contact={contact} />;
}