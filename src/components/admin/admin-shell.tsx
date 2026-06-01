"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AdminLogoutButton } from "@/components/admin/admin-logout-button";

export function AdminShell({
  children,
  basePath,
}: {
  children: React.ReactNode;
  basePath: string;
}) {
  const pathname = usePathname();
  const href = (path = "") => `${basePath}${path}`;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/95">
        <div className="container-responsive flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
          <Link href={basePath} className="font-palestine text-3xl text-white">
            أرزاق
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <AdminNavLink href={basePath} pathname={pathname} exact>
              الرئيسية
            </AdminNavLink>
            <AdminNavLink href={href("/jobs")} pathname={pathname}>
              الطلبات
            </AdminNavLink>
            <AdminNavLink href={href("/users")} pathname={pathname}>
              المستخدمون
            </AdminNavLink>
            <AdminNavLink href={href("/verification")} pathname={pathname}>
              طلبات التوثيق
            </AdminNavLink>
            <AdminNavLink href={href("/reports")} pathname={pathname}>
              البلاغات
            </AdminNavLink>
            <AdminNavLink href={href("/store")} pathname={pathname}>
              المتجر
            </AdminNavLink>
            <AdminNavLink href={href("/audit")} pathname={pathname}>
              التدقيق
            </AdminNavLink>
            <AdminNavLink href={href("/admins")} pathname={pathname}>
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
  exact = false,
  children,
}: {
  href: string;
  pathname: string;
  exact?: boolean;
  children: React.ReactNode;
}) {
  const active = exact ? pathname === href : pathname.startsWith(href);

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
