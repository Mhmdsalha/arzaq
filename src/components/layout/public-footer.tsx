import { HeartHandshake, MessageCircle } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { publicNavLinks } from "@/constants/nav-links";

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-responsive grid gap-8 py-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-md text-sm leading-7 text-slate-600">
            أرزاق مساحة محلية تساعد أهل غزة على نشر الطلبات، العثور على مهارات موثوقة، والتواصل
            بسرعة عبر واتساب بدون تعقيد.
          </p>
          <Button asChild className="w-full sm:w-auto">
            <a href="https://wa.me/970599000000" target="_blank" rel="noreferrer">
              <MessageCircle className="size-4" />
              تواصل معنا عبر واتساب
            </a>
          </Button>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-950">روابط مهمة</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {publicNavLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-primary-dark">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-950">للمجتمع</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>
              <Link href="/about" className="hover:text-primary-dark">
                عن أرزاق
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary-dark">
                تواصل معنا
              </Link>
            </li>
            <li className="flex items-center gap-2 text-primary-dark">
              <HeartHandshake className="size-4" />
              مبني بروح محلية
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">
        © 2026 أرزاق. كل الحقوق محفوظة.
      </div>
    </footer>
  );
}
