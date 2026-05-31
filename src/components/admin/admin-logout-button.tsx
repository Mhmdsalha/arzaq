"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function AdminLogoutButton() {
  return (
    <button
      type="button"
      onClick={() => void signOut({ redirectTo: "/auth/login" })}
      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-400/30 px-4 text-sm font-semibold text-red-200 transition hover:bg-red-500/10"
    >
      <LogOut className="size-4" />
      تسجيل الخروج
    </button>
  );
}
