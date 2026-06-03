import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export async function CTASection() {
  const session = await auth();
  const isAuthenticated = Boolean(session?.user?.id);

  return (
    <section className="bg-slate-50 py-14">
      <div className="container">
        <div className="rounded-[2rem] bg-primary-dark p-8 text-white shadow-sm md:p-10">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-3xl font-bold">جاهز تبدأ مع أرزاق؟</h2>
              <p className="mt-3 max-w-2xl leading-8 text-emerald-50">
                سجل كمقدم خدمة لبناء ملفك المهني، أو انشر طلبك الأول عندما نفتح لوحة المستخدم.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {!isAuthenticated ? (
                <Button asChild size="lg" variant="secondary">
                  <Link href="/auth/register">أنشئ حساب</Link>
                </Button>
              ) : null}
              <Button asChild size="lg" className="bg-white/10 text-white hover:bg-white/20">
                <Link href="/how-it-works">
                  اعرف أكثر
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
