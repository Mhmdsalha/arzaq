import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminBasePath } from "@/lib/admin-path";
import { auth } from "@/lib/auth";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "لوحة إدارة أرزاق",
  description: "لوحة إدارة داخلية لمنصة أرزاق.",
  path: "/admin",
  noIndex: true,
});

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    notFound();
  }

  return <AdminShell basePath={getAdminBasePath()}>{children}</AdminShell>;
}
