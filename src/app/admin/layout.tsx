import { AdminShell } from "@/components/admin/admin-shell";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "لوحة إدارة أرزاق",
  description: "لوحة إدارة داخلية لمنصة أرزاق.",
  path: "/admin",
  noIndex: true,
});

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminShell>{children}</AdminShell>;
}
