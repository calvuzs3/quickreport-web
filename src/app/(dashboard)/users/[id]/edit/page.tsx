import { getUser } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import UserEditForm from "./UserEditForm";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  let user: Awaited<ReturnType<typeof getUser>>;
  try {
    user = await getUser(id);
  } catch {
    notFound();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/users" style={{ color: "var(--color-text-muted)", fontSize: 13 }}>← Utenti</Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>Modifica utente</h1>
          <p className="page-subtitle" style={{ fontFamily: "monospace" }}>{user.username}</p>
        </div>
      </div>
      <UserEditForm user={user} />
    </div>
  );
}
