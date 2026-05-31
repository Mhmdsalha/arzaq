import { redirect } from "next/navigation";

import { DashboardLayout as DashboardShell } from "@/components/layout/dashboard-layout";
import { auth } from "@/lib/auth";
import { createPageMetadata } from "@/lib/seo";
import { getDashboardShellUser } from "@/services/dashboard.service";

export const metadata = createPageMetadata({
  title: "لوحة التحكم",
  description: "لوحة تحكم المستخدم داخل منصة أرزاق.",
  path: "/dashboard",
  noIndex: true,
});

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const user = await getDashboardShellUser(session.user.id);

  if (!user) {
    redirect("/auth/login");
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
