"use client";

import { PanelRightClose, PanelRightOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/layout/logo";
import { UserDropdown } from "@/components/layout/user-dropdown";
import { Button } from "@/components/ui/button";
import { getDashboardNavLinks } from "@/constants/dashboard-nav";
import { cn } from "@/lib/utils";
import type { DashboardShellUser } from "@/types/dashboard";

export function DashboardSidebar({ user }: { user: DashboardShellUser }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navLinks = getDashboardNavLinks(user.accountType);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 border-l border-slate-200 bg-white p-4 transition-all duration-200 lg:flex lg:flex-col",
        isCollapsed ? "w-24" : "w-72",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        {!isCollapsed ? <Logo /> : <Logo className="[&_span:last-child]:hidden" />}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed((value) => !value)}
          aria-label={isCollapsed ? "توسيع القائمة" : "طي القائمة"}
        >
          {isCollapsed ? (
            <PanelRightOpen className="size-5" />
          ) : (
            <PanelRightClose className="size-5" />
          )}
        </Button>
      </div>

      <nav className="mt-8 grid gap-2" aria-label="روابط لوحة التحكم">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl border-r-4 border-r-transparent px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950",
                link.featured && "bg-primary text-white hover:bg-primary-dark hover:text-white",
                isActive && "border-r-primary bg-primary/10 text-primary-dark",
                isCollapsed && "justify-center px-2",
              )}
              title={isCollapsed ? link.label : undefined}
            >
              <Icon className="size-5 shrink-0" />
              {!isCollapsed ? <span>{link.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <UserDropdown user={user} compact={isCollapsed} placement="top" />
      </div>
    </aside>
  );
}
