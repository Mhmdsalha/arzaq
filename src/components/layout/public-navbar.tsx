"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { publicNavLinks } from "@/constants/nav-links";
import { cn } from "@/lib/utils";

export function PublicNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const isHome = pathname === "/";
  const isTransparent = isHome && !hasScrolled && !isOpen;

  useEffect(() => {
    function handleScroll() {
      setHasScrolled(window.scrollY > 80);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        isTransparent
          ? "border-transparent bg-transparent"
          : "border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-md",
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo
          className={cn(
            isTransparent &&
              "text-white [&_span:first-child]:bg-white [&_span:first-child]:text-primary-dark",
          )}
        />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="التنقل الرئيسي">
          {publicNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950",
                isTransparent && "text-white/85 hover:bg-white/10 hover:text-white",
                pathname === link.href && "bg-primary/10 text-primary-dark",
                isTransparent && pathname === link.href && "bg-white/15 text-white",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            asChild
            variant="ghost"
            className={cn(isTransparent && "text-white hover:bg-white/10 hover:text-white")}
          >
            <Link href="/auth/login">تسجيل الدخول</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/register">انضم الآن</Link>
          </Button>
        </div>

        <button
          type="button"
          className={cn(
            "inline-flex size-11 items-center justify-center rounded-xl border transition lg:hidden",
            isTransparent
              ? "border-white/25 text-white hover:bg-white/10"
              : "border-slate-200 text-slate-700",
          )}
          onClick={() => setIsOpen((value) => !value)}
          aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-slate-200 bg-white shadow-sm lg:hidden">
          <div className="container grid gap-2 py-4">
            {publicNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100",
                  pathname === link.href && "bg-primary/10 text-primary-dark",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button asChild variant="secondary">
                <Link href="/auth/login">دخول</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">تسجيل</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
