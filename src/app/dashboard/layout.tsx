import { redirect } from "next/navigation";

import { DashboardLayout as DashboardShell } from "@/components/layout/dashboard-layout";
import { auth } from "@/lib/auth";
import { createPageMetadata } from "@/lib/seo";
import { getDashboardShellUser } from "@/services/dashboard.service";
import type { DashboardShellUser } from "@/types/dashboard";

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

  let user: DashboardShellUser | null = null;

  try {
    user = await getDashboardShellUser(session.user.id);
  } catch (error) {
    console.error("Failed to load dashboard shell user", error);
    user = {
      id: session.user.id,
      name: session.user.name ?? "مستخدم أرزاق",
      email: session.user.email ?? null,
      role: session.user.role,
      accountType: session.user.accountType,
      isVerified: session.user.isVerified,
      profile: null,
    };
  }

  if (!user) {
    redirect("/auth/login");
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
