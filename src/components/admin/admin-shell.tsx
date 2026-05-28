"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AdminLogoutButton } from "@/components/admin/admin-logout-button";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/95">
        <div className="container-responsive flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
          <Link href="/admin" className="font-palestine text-3xl text-white">
            أرزاق
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <Link className="rounded-xl px-3 py-2 hover:bg-white/10" href="/admin">
              الرئيسية
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-white/10" href="/admin/jobs">
              الطلبات
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-white/10" href="/admin/users">
              المستخدمون
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-white/10" href="/admin/admins">
              حسابات الإدارة
            </Link>
          </nav>
          <AdminLogoutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
