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
            <AdminNavLink href="/admin" pathname={pathname}>
              الرئيسية
            </AdminNavLink>
            <AdminNavLink href="/admin/jobs" pathname={pathname}>
              الطلبات
            </AdminNavLink>
            <AdminNavLink href="/admin/users" pathname={pathname}>
              المستخدمون
            </AdminNavLink>
            <AdminNavLink href="/admin/verification" pathname={pathname}>
              طلبات التوثيق
            </AdminNavLink>
            <AdminNavLink href="/admin/reports" pathname={pathname}>
              البلاغات
            </AdminNavLink>
            <AdminNavLink href="/admin/audit" pathname={pathname}>
              التدقيق
            </AdminNavLink>
            <AdminNavLink href="/admin/admins" pathname={pathname}>
              حسابات الإدارة
            </AdminNavLink>
          </nav>
          <AdminLogoutButton />
        </div>
      </header>
      {children}
    </div>
  );
}

function AdminNavLink({
  href,
  pathname,
  children,
}: {
  href: string;
  pathname: string;
  children: React.ReactNode;
}) {
  const active = href === "/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      className={`rounded-xl px-3 py-2 transition hover:bg-white/10 ${
        active ? "bg-primary/20 font-bold text-primary-light" : ""
      }`}
      href={href}
    >
      {children}
    </Link>
  );
}
