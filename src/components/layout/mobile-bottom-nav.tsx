"use client";

import { BriefcaseBusiness, Home, UserCircle, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { AccountSheet } from "@/components/shared/AccountSheet";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "الرئيسية", icon: Home, isActive: (pathname: string) => pathname === "/" },
  {
    href: "/jobs",
    label: "الطلبات",
    icon: BriefcaseBusiness,
    isActive: (pathname: string) => pathname.startsWith("/jobs"),
  },
  {
    href: "/providers",
    label: "الخدمات",
    icon: UsersRound,
    isActive: (pathname: string) => pathname.startsWith("/providers"),
  },
];

function shortName(name?: string | null) {
  const first = name?.trim().split(/\s+/)[0] || "حسابي";
  return first.length > 6 ? `${first.slice(0, 6)}...` : first;
}

function badgeText(count: number) {
  if (count <= 0) return null;
  return count > 9 ? "٩+" : count.toLocaleString("ar");
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuth, isLoading } = useCurrentUser();
  const {
    unreadCount,
    summary,
    isLoading: isSummaryLoading,
  } = useUnreadCount(isAuth, user?.accountType);
  const navUser = summary?.user ?? user;
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isAccountActive = pathname.startsWith("/dashboard") || pathname.startsWith("/auth");

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden"
        aria-label="تنقل الجوال"
      >
        <div className="grid h-16 grid-cols-4">
          {tabs.map((item) => {
            const Icon = item.icon;
            const isActive = item.isActive(pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 text-xs font-medium text-slate-500 transition-colors",
                  isActive && "font-bold text-primary-dark",
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 h-1 w-6 rounded-full bg-transparent transition-colors",
                    isActive && "bg-primary",
                  )}
                />
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              if (isAuth) {
                setIsSheetOpen(true);
                return;
              }

              router.push("/auth/login");
            }}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 text-xs font-medium text-slate-500 transition-colors disabled:opacity-60",
              isAccountActive && "font-bold text-primary-dark",
            )}
          >
            <span
              className={cn(
                "absolute top-1 h-1 w-6 rounded-full bg-transparent transition-colors",
                isAccountActive && "bg-primary",
              )}
            />
            {isLoading ? (
              <span className="size-7 animate-pulse rounded-full bg-slate-200" />
            ) : isAuth ? (
              <span className="relative">
                {summary?.avatarUrl ? (
                  <Image
                    src={summary.avatarUrl}
                    alt={navUser?.name || "حسابي"}
                    width={28}
                    height={28}
                    className="size-7 rounded-full border-2 border-primary object-cover"
                  />
                ) : (
                  <UserCircle className="size-6 fill-primary/15 text-primary-dark" />
                )}
                {badgeText(unreadCount) ? (
                  <span className="absolute -right-2 -top-2 flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-[18px] text-white">
                    {badgeText(unreadCount)}
                  </span>
                ) : null}
              </span>
            ) : (
              <UserCircle className="size-6" />
            )}
            <span>{isAuth ? shortName(navUser?.name) : "حسابي"}</span>
          </button>
        </div>
      </nav>

      <AccountSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        user={navUser}
        summary={summary}
        isLoading={isSummaryLoading}
        unreadCount={unreadCount}
      />
    </>
  );
}
