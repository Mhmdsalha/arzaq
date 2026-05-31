"use client";

import type { AccountType } from "@prisma/client";
import {
  BriefcaseBusiness,
  ChevronDown,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { useEffect, useState } from "react";

import { Logo } from "@/components/layout/logo";
import { LogoutConfirmDialog } from "@/components/shared/LogoutConfirmDialog";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { signOutAndRedirect } from "@/lib/client-signout";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "الرئيسية", active: (pathname: string) => pathname === "/" },
  { href: "/jobs", label: "الطلبات", active: (pathname: string) => pathname.startsWith("/jobs") },
  {
    href: "/providers",
    label: "مقدمو الخدمات",
    active: (pathname: string) => pathname.startsWith("/providers"),
  },
  {
    href: "/how-it-works",
    label: "كيف يعمل",
    active: (pathname: string) => pathname.startsWith("/how-it-works"),
  },
];

function firstName(name?: string | null) {
  return name?.trim().split(/\s+/)[0] || "حسابي";
}

function accountTypeLabel(accountType?: AccountType) {
  return accountType === "PROVIDER" ? "مقدم خدمة" : "صاحب طلب";
}

export function PublicNavbar() {
  const pathname = usePathname();
  const { user, isAuth, isLoading } = useCurrentUser();
  const { unreadCount, summary } = useUnreadCount(isAuth, user?.accountType);
  const navUser = summary?.user ?? user;
  const [isOpen, setIsOpen] = useState(false);
  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userMenuPathname, setUserMenuPathname] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const isHome = pathname === "/";
  const isMobileMenuOpen = isOpen && openPathname === pathname;
  const isUserMenuVisible = isUserMenuOpen && userMenuPathname === pathname;
  const isTransparent = isHome && !hasScrolled && !isMobileMenuOpen;

  useEffect(() => {
    if (!isHome) {
      return;
    }

    const hero = document.querySelector("[data-hero-section='true']");

    if (hero) {
      const observer = new IntersectionObserver(
        ([entry]) => setHasScrolled(!entry.isIntersecting),
        { rootMargin: "-80px 0px 0px 0px", threshold: 0.02 },
      );

      observer.observe(hero);
      return () => observer.disconnect();
    }

    function handleScroll() {
      setHasScrolled(window.scrollY > 80);
    }

    window.requestAnimationFrame(handleScroll);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 safe-top transition-all duration-300",
        isTransparent
          ? "border-transparent bg-transparent"
          : "border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-md",
      )}
    >
      <div className="container-responsive flex h-20 items-center justify-between gap-4 lg:h-20 lg:pt-3">
        <Logo
          className={cn(isTransparent && "text-white")}
          textClassName={cn(!isTransparent && "translate-y-0 pt-2 lg:-translate-y-2 lg:pt-0")}
        />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="التنقل الرئيسي">
          {navLinks.map((link) => {
            const active = link.active(pathname);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950",
                  active && "bg-primary/10 font-bold text-primary-dark",
                  isTransparent && "text-white/85 hover:bg-white/10 hover:text-white",
                  isTransparent && active && "bg-white/15 text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {isLoading ? (
            <div className="flex animate-pulse items-center gap-2">
              <div className="h-10 w-20 rounded-xl bg-slate-200/70" />
              <div className="h-10 w-28 rounded-xl bg-slate-200/70" />
            </div>
          ) : isAuth ? (
            <div className="relative flex items-center gap-2">
              <NotificationBell count={unreadCount} isTransparent={isTransparent} />
              <button
                type="button"
                onClick={() => {
                  setUserMenuPathname(pathname);
                  setIsUserMenuOpen(!isUserMenuVisible);
                }}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-xl px-2 text-sm font-bold transition",
                  isTransparent
                    ? "text-white hover:bg-white/10"
                    : "text-slate-700 hover:bg-slate-100",
                )}
              >
                <Avatar src={summary?.avatarUrl} name={navUser?.name} />
                <span className="max-w-24 truncate">{firstName(navUser?.name)}</span>
                <ChevronDown className="size-4" />
              </button>

              {isUserMenuVisible ? (
                <UserMenu
                  name={navUser?.name}
                  accountType={navUser?.accountType}
                  avatarUrl={summary?.avatarUrl}
                  onLogout={() => setShowLogoutConfirm(true)}
                />
              ) : null}
            </div>
          ) : (
            <>
              <Button
                asChild
                variant="secondary"
                className={cn(
                  isTransparent && "border-white/25 bg-white/10 text-white hover:bg-white/20",
                )}
              >
                <Link href="/auth/login">دخول</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">إنشاء حساب</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex min-h-16 items-center gap-2 lg:hidden">
          {isAuth ? <NotificationBell count={unreadCount} isTransparent={isTransparent} /> : null}
          <button
            type="button"
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-xl border transition",
              isTransparent
                ? "border-white/25 text-white hover:bg-white/10"
                : "border-slate-200 text-slate-700",
            )}
            onClick={() => {
              setOpenPathname(pathname);
              setIsOpen(!isMobileMenuOpen);
            }}
            aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div className="fixed inset-x-0 top-[calc(5rem+env(safe-area-inset-top))] border-t border-slate-200 bg-white shadow-lg lg:hidden">
          <div className="container-responsive grid gap-2 py-4">
            {navLinks.map((link) => {
              const active = link.active(pathname);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex min-h-11 items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100",
                    active && "bg-primary/10 font-bold text-primary-dark",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            {!isAuth ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button asChild variant="secondary">
                  <Link href="/auth/login">دخول</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">تسجيل</Link>
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <LogoutConfirmDialog
        open={showLogoutConfirm}
        isPending={isSigningOut}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={async () => {
          setIsSigningOut(true);
          setIsUserMenuOpen(false);
          await signOutAndRedirect();
        }}
      />
    </header>
  );
}

function UserMenu({
  name,
  accountType,
  avatarUrl,
  onLogout,
}: {
  name?: string | null;
  accountType?: AccountType;
  avatarUrl?: string | null;
  onLogout: () => void;
}) {
  const isProvider = accountType === "PROVIDER";

  return (
    <div className="absolute right-0 top-12 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 shadow-xl">
      <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
        <Avatar src={avatarUrl} name={name} size="lg" />
        <div className="min-w-0">
          <p className="truncate font-bold text-slate-950">{name}</p>
          <span
            className={cn(
              "mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-bold",
              isProvider ? "bg-blue-50 text-blue-700" : "bg-primary/10 text-primary-dark",
            )}
          >
            {accountTypeLabel(accountType)}
          </span>
        </div>
      </div>
      <div className="my-2 border-t border-slate-100" />
      <DropdownItem href="/" icon={Home} label="الرئيسية" />
      <DropdownItem href="/dashboard" icon={LayoutDashboard} label="لوحة التحكم" />
      <DropdownItem href="/dashboard/profile" icon={User} label="بروفايلي" />
      {isProvider ? (
        <DropdownItem href="/dashboard/offers" icon={FileText} label="عروضي" />
      ) : (
        <>
          <DropdownItem href="/dashboard/jobs" icon={BriefcaseBusiness} label="طلباتي" />
          <DropdownItem href="/dashboard/jobs/new" icon={Plus} label="نشر طلب" />
        </>
      )}
      <div className="my-2 border-t border-slate-100" />
      <DropdownItem href="/dashboard/settings" icon={Settings} label="الإعدادات" />
      <div className="my-2 border-t border-slate-100" />
      <button
        type="button"
        onClick={onLogout}
        className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-sm font-bold text-red-600 hover:bg-red-50"
      >
        <LogOut className="size-4" />
        تسجيل الخروج
      </button>
    </div>
  );
}

function DropdownItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold hover:bg-slate-50"
    >
      <Icon className="size-4" />
      {label}
    </Link>
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
  const avatarSize = size === "lg" ? "size-11" : "size-8";

  if (src) {
    return (
      <Image
        src={src}
        alt={name || "صورة الحساب"}
        width={size === "lg" ? 44 : 32}
        height={size === "lg" ? 44 : 32}
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
