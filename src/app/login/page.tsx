import LoginForm from "./LoginForm";
import { getSessionToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const token = await getSessionToken();
  if (token) redirect("/dashboard");

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--color-bg)",
    }}>
      <div style={{ width: "100%", maxWidth: 380, padding: "0 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "var(--color-primary)",
            marginBottom: 12,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>QuickReport</h1>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            Industrial checkup management
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}