import { requireAuth } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import styles from "./layout.module.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // requireAuth verifies the HMAC-signed session cookie; redirects to /login if invalid
  const { role } = await requireAuth();

  return (
    <div className={styles.shell}>
      <Sidebar role={role} />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
