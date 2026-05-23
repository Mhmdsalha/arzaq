"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { UserDropdown } from "@/components/layout/user-dropdown";
import { Button } from "@/components/ui/button";
import { getDashboardNavLinks } from "@/constants/dashboard-nav";
import { cn } from "@/lib/utils";
import type { DashboardShellUser } from "@/types/dashboard";

export function DashboardMobileNav({
  user,
  isOpen,
  onClose,
}: {
  user: DashboardShellUser;
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const navLinks = getDashboardNavLinks(user.accountType);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden" role="dialog" aria-modal="true">
      <button
        className="absolute inset-0 cursor-default"
        type="button"
        aria-label="إغلاق القائمة"
        onClick={onClose}
      />
      <section className="absolute inset-x-0 bottom-0 rounded-t-[2rem] bg-white p-4 shadow-2xl">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">قائمة لوحة التحكم</h2>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="إغلاق">
            <X className="size-5" />
          </Button>
        </div>

        <nav className="mt-4 grid gap-2" aria-label="روابط لوحة التحكم للجوال">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl border-r-4 border-r-transparent px-3 py-2 text-sm font-semibold text-slate-600",
                  link.featured && "bg-primary text-white",
                  isActive && "border-r-primary bg-primary/10 text-primary-dark",
                )}
              >
                <Icon className="size-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <UserDropdown user={user} placement="top" />
        </div>
      </section>
    </div>
  );
}
