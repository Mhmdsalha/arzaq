"use client";

import type { AccountType } from "@prisma/client";
import {
  Bell,
  BriefcaseBusiness,
  ChevronLeft,
  FileText,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ComponentType } from "react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { useUnreadCount } from "@/hooks/useUnreadCount";
import { cn } from "@/lib/utils";

type AccountSummary = ReturnType<typeof useUnreadCount>["summary"];

function firstName(name?: string | null) {
  return name?.trim().split(/\s+/)[0] || "حسابي";
}

function accountTypeLabel(accountType?: AccountType) {
  return accountType === "PROVIDER" ? "مقدم خدمة" : "صاحب طلب";
}

function unreadBadge(count: number) {
  if (count <= 0) return null;
  return count > 9 ? "٩+" : count.toLocaleString("ar");
}

export function AccountSheet({
  open,
  onOpenChange,
  user,
  summary,
  isLoading,
  unreadCount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    name?: string | null;
    accountType?: AccountType;
  } | null;
  summary: AccountSummary;
  isLoading: boolean;
  unreadCount: number;
}) {
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const isProvider = user?.accountType === "PROVIDER";

  const closeSheet = useCallback(() => {
    setShowLogoutConfirm(false);
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeSheet();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeSheet, open]);

  if (!open) return null;

  const stats = isProvider
    ? [
        { label: "عروضي", value: summary?.stats.sentOffers ?? 0 },
        { label: "المقبولة", value: summary?.stats.acceptedOffers ?? 0 },
      ]
    : [
        { label: "طلباتي", value: summary?.stats.postedJobs ?? 0 },
        { label: "العروض الواردة", value: summary?.stats.receivedOffers ?? 0 },
      ];

  function closeAndGo(href: string) {
    closeSheet();
    router.push(href);
  }

  async function confirmSignOut() {
    closeSheet();
    await signOut({ callbackUrl: "/" });
  }

  return (
    <div className="fixed inset-0 z-[70] md:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/40"
        aria-label="إغلاق"
        onClick={closeSheet}
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl">
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-200" />
        <button
          type="button"
          className="absolute left-4 top-4 inline-flex size-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          onClick={closeSheet}
          aria-label="إغلاق"
        >
          <X className="size-5" />
        </button>

        {isLoading ? (
          <SheetSkeleton />
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Avatar src={summary?.avatarUrl} name={user?.name} size="lg" />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-bold text-slate-950">{user?.name}</h2>
                <span
                  className={cn(
                    "mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
                    isProvider ? "bg-blue-50 text-blue-700" : "bg-primary/10 text-primary-dark",
                  )}
                >
                  {accountTypeLabel(user?.accountType)}
                </span>
              </div>
            </div>

            {isProvider ? (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">اكتمال البروفايل</span>
                  <span className="font-bold text-primary-dark">
                    {(summary?.profileCompletion ?? 0).toLocaleString("ar")}٪
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${summary?.profileCompletion ?? 0}%` }}
                  />
                </div>
              </div>
            ) : null}

            <div className="mt-5 grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-slate-50 p-3 text-center">
                  <p className="text-lg font-bold text-slate-950">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-1">
              <SheetItem
                icon={LayoutDashboard}
                label="لوحة التحكم"
                onClick={() => closeAndGo("/dashboard")}
              />
              <SheetItem
                icon={User}
                label="بروفايلي"
                onClick={() => closeAndGo("/dashboard/profile")}
              />
              {isProvider ? (
                <>
                  <SheetItem
                    icon={FileText}
                    label="عروضي"
                    onClick={() => closeAndGo("/dashboard/offers")}
                  />
                  <SheetItem
                    icon={Search}
                    label="تصفح الطلبات"
                    onClick={() => closeAndGo("/jobs")}
                  />
                </>
              ) : (
                <>
                  <SheetItem
                    icon={BriefcaseBusiness}
                    label="طلباتي"
                    onClick={() => closeAndGo("/dashboard/jobs")}
                  />
                  <SheetItem
                    icon={Plus}
                    label="نشر طلب جديد"
                    onClick={() => closeAndGo("/dashboard/jobs/new")}
                    className="bg-primary/10 text-primary-dark hover:bg-primary/15"
                  />
                </>
              )}
            </div>

            <div className="my-4 border-t border-slate-100" />

            <div className="space-y-1">
              <SheetItem
                icon={Bell}
                label="الإشعارات"
                badge={unreadBadge(unreadCount)}
                onClick={() => closeAndGo("/dashboard/notifications")}
              />
              <SheetItem
                icon={Settings}
                label="الإعدادات"
                onClick={() => closeAndGo("/dashboard/settings")}
              />
            </div>

            <div className="my-4 border-t border-slate-100" />

            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="flex h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="size-5" />
              تسجيل الخروج
            </button>

            <p className="mt-5 text-center text-xs text-slate-400">
              أرزاق • منصة العمل المحلي في غزة
            </p>
          </>
        )}
      </div>

      {showLogoutConfirm ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-950">تسجيل الخروج</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              هل أنت متأكد أنك تريد تسجيل الخروج؟
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowLogoutConfirm(false)}>
                إلغاء
              </Button>
              <Button type="button" variant="destructive" onClick={confirmSignOut}>
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SheetItem({
  icon: Icon,
  label,
  onClick,
  badge,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  badge?: string | null;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50",
        className,
      )}
    >
      <Icon className="size-5" />
      <span className="flex-1 text-right">{label}</span>
      {badge ? (
        <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}
      <ChevronLeft className="size-4 text-slate-400" />
    </button>
  );
}

function Avatar({
  src,
  name,
  size = "sm",
}: {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "lg";
}) {
  const avatarSize = size === "lg" ? "size-14" : "size-8";

  if (src) {
    return (
      <Image
        src={src}
        alt={name || "صورة الحساب"}
        width={size === "lg" ? 56 : 32}
        height={size === "lg" ? 56 : 32}
        className={cn("rounded-full border-2 border-primary object-cover", avatarSize)}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border-2 border-primary bg-primary font-bold text-white",
        avatarSize,
      )}
    >
      {firstName(name).slice(0, 1)}
    </span>
  );
}

function SheetSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="flex items-center gap-3">
        <div className="size-14 rounded-full bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-slate-100" />
          <div className="h-6 w-20 rounded-full bg-slate-100" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 rounded-2xl bg-slate-100" />
        <div className="h-16 rounded-2xl bg-slate-100" />
      </div>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-12 rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}
