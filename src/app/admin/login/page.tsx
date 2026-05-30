import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "دخول الإدارة",
};

export default async function AdminLoginPage() {
  const session = await auth();

  if (session?.user?.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <section className="grid min-h-screen place-items-center bg-slate-950 px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(22,163,74,0.22),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(134,239,172,0.12),transparent_35%)]" />
      <div className="relative z-10 flex w-full flex-col items-center">
        <AdminLoginForm />
        <p className="mt-5 text-center text-xs text-slate-400">
          أرزاق · مساحة إدارة داخلية منفصلة
        </p>
      </div>
    </section>
  );
}
