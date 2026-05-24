"use client";

import { useState } from "react";

import { DashboardMobileNav } from "@/components/layout/dashboard-mobile-nav";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import type { DashboardShellUser } from "@/types/dashboard";

export function DashboardLayout({
  user,
  children,
}: {
  user: DashboardShellUser;
  children: React.ReactNode;
}) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardSidebar
        user={user}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />
      <div
        className={
          isSidebarCollapsed
            ? "min-w-0 transition-all duration-200 lg:pr-24"
            : "min-w-0 transition-all duration-200 lg:pr-72"
        }
      >
        <DashboardTopbar user={user} onOpenMenu={() => setIsMobileNavOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
      <DashboardMobileNav
        user={user}
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />
    </div>
  );
}
