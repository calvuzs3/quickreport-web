import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QReport Admin",
  description: "QReport — industrial checkup management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}