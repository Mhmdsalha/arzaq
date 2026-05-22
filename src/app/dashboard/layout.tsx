import { redirect } from "next/navigation";

import { DashboardLayout as DashboardShell } from "@/components/layout/dashboard-layout";
import { auth } from "@/lib/auth";
import { getDashboardShellUser } from "@/services/dashboard.service";

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
