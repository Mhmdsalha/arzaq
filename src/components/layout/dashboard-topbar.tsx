"use client";

import { Menu } from "lucide-react";

import { UserDropdown } from "@/components/layout/user-dropdown";
import { Button } from "@/components/ui/button";
import type { DashboardShellUser } from "@/types/dashboard";

export function DashboardTopbar({
  user,
  onOpenMenu,
}: {
  user: DashboardShellUser;
  onOpenMenu: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white safe-top lg:hidden">
      <div className="flex h-20 items-center justify-between px-4">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="size-11"
          onClick={onOpenMenu}
          aria-label="فتح قائمة لوحة التحكم"
        >
          <Menu className="size-5" />
        </Button>
        <span className="min-w-0 flex-1" aria-hidden="true" />
        <UserDropdown user={user} compact />
      </div>
    </header>
  );
}
