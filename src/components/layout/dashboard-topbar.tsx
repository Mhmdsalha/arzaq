"use client";

import { Menu } from "lucide-react";

import { Logo } from "@/components/layout/logo";
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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
      <div className="flex h-16 items-center justify-between px-4">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={onOpenMenu}
          aria-label="فتح قائمة لوحة التحكم"
        >
          <Menu className="size-5" />
        </Button>
        <Logo />
        <UserDropdown user={user} compact />
      </div>
    </header>
  );
}
