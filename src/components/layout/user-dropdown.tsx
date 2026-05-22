"use client";

import { BadgeCheck, ChevronDown, LogOut, MessageCircle, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";

import { logoutAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DashboardShellUser } from "@/types/dashboard";

const roleLabels = {
  ADMIN: "مدير",
  USER: "مستخدم",
};

export function UserDropdown({
  user,
  compact = false,
}: {
  user: DashboardShellUser;
  compact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const avatarUrl = user.profile?.avatarUrl;

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        className={cn(
          "flex min-h-11 w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 text-right shadow-sm transition hover:bg-slate-50",
          compact && "justify-center border-transparent bg-transparent shadow-none",
        )}
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
      >
        <Avatar name={user.name} avatarUrl={avatarUrl} />
        {!compact ? (
          <>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1 truncate text-sm font-bold text-slate-950">
                {user.name}
                {user.profile?.isTrusted ? (
                  <ShieldCheck className="size-4 shrink-0 text-primary" aria-label="موثوق" />
                ) : null}
              </span>
              <span className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {roleLabels[user.role]}
              </span>
            </span>
            <ChevronDown className="size-4 text-slate-400" />
          </>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <Avatar name={user.name} avatarUrl={avatarUrl} />
            <div className="min-w-0">
              <p className="truncate font-bold text-slate-950">{user.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary-dark">
                  {roleLabels[user.role]}
                </span>
                {user.profile?.isTrusted ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    <BadgeCheck className="size-3" />
                    موثوق
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-2">
            <Link
              href="/dashboard/profile"
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => setIsOpen(false)}
            >
              إدارة البروفايل
            </Link>
            {user.profile?.whatsapp ? (
              <a
                href={`https://wa.me/${user.profile.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-primary-dark hover:bg-primary/10"
              >
                <MessageCircle className="size-4" />
                فتح واتساب
              </a>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              className="justify-start text-red-600"
              onClick={handleLogout}
              disabled={isPending}
            >
              <LogOut className="size-4" />
              {isPending ? "جاري الخروج..." : "تسجيل الخروج"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null | undefined }) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={44}
        height={44}
        className="size-11 shrink-0 rounded-2xl object-cover"
      />
    );
  }

  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-base font-bold text-white">
      {name.slice(0, 1)}
    </span>
  );
}
