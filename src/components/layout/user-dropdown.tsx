"use client";

import { BadgeCheck, ChevronDown, Home, LogOut, MessageCircle, ShieldCheck, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { LogoutConfirmDialog } from "@/components/shared/LogoutConfirmDialog";
import { Button } from "@/components/ui/button";
import { signOutAndRedirect } from "@/lib/client-signout";
import { cn } from "@/lib/utils";
import type { DashboardShellUser } from "@/types/dashboard";

const roleLabels = {
  ADMIN: "مدير",
  USER: "مستخدم",
};

const accountTypeLabels = {
  CLIENT: "صاحب طلب",
  PROVIDER: "مقدم خدمة",
};

export function UserDropdown({
  user,
  compact = false,
  placement = "bottom",
  align = "right",
}: {
  user: DashboardShellUser;
  compact?: boolean;
  placement?: "top" | "bottom";
  align?: "right" | "left";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const avatarUrl = user.profile?.avatarUrl;
  const pathname = usePathname();
  const isMenuVisible = isOpen && openPathname === pathname;

  async function handleLogout() {
    setIsPending(true);
    setIsOpen(false);
    await signOutAndRedirect();
  }

  return (
    <div className="relative">
      <button
        type="button"
        className={cn(
          "flex min-h-11 w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 text-right shadow-sm transition hover:bg-slate-50",
          compact && "justify-center border-transparent bg-transparent shadow-none",
        )}
        onClick={() => {
          setOpenPathname(pathname);
          setIsOpen(!isMenuVisible);
        }}
        aria-expanded={isOpen}
      >
        <Avatar name={user.name} avatarUrl={avatarUrl} />
        {!compact ? (
          <>
            <span className="min-w-0 flex-1 overflow-hidden">
              <span className="flex min-w-0 items-center gap-1 text-sm font-bold text-slate-950">
                <span className="min-w-0 truncate">{user.name}</span>
                {user.profile?.isTrusted ? (
                  <ShieldCheck className="size-4 shrink-0 text-primary" aria-label="موثوق" />
                ) : null}
              </span>
              <span className="mt-1 inline-flex max-w-full items-center truncate whitespace-nowrap rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold leading-5 text-slate-600">
                {accountTypeLabels[user.accountType]}
              </span>
            </span>
            <ChevronDown className="size-4 text-slate-400" />
          </>
        ) : null}
      </button>

      {isMenuVisible ? (
        <div
          className={cn(
            "absolute z-50 max-h-[min(420px,70vh)] w-72 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-xl",
            align === "left" ? "left-0" : "right-0",
            placement === "top" ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <Avatar name={user.name} avatarUrl={avatarUrl} />
            <div className="min-w-0">
              <p className="truncate font-bold text-slate-950">{user.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary-dark">
                  {roleLabels[user.role]}
                </span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  {accountTypeLabels[user.accountType]}
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
              href="/"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Home className="size-4" />
              الرئيسية
            </Link>
            <Link
              href="/store"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Store className="size-4" />
              المتجر
            </Link>
            <Link
              href="/dashboard/profile"
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
              onClick={() => setShowLogoutConfirm(true)}
              disabled={isPending}
            >
              <LogOut className="size-4" />
              {isPending ? "جاري الخروج..." : "تسجيل الخروج"}
            </Button>
          </div>
        </div>
      ) : null}

      <LogoutConfirmDialog
        open={showLogoutConfirm}
        isPending={isPending}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
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
