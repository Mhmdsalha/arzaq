import { ArrowLeft, Search, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="overflow-hidden bg-white">
      <div className="container grid min-h-[calc(100vh-4rem)] items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary-dark">
            <Sparkles className="size-4" />
            سوق عمل محلي لأهل غزة
          </div>
          <div className="space-y-5">
            <h1 className="text-4xl font-bold leading-[1.25] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              اطلب خدمة، أو اعرض مهارتك، وابدأ رزقك بثقة.
            </h1>
            <p className="max-w-2xl text-lg leading-9 text-slate-600">
              أرزاق يربط أصحاب الطلبات بمقدمي الخدمات المحليين بسرعة وبواجهة عربية خفيفة تعمل بكفاءة
              على الجوال والاتصالات الضعيفة.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/jobs">
                تصفح الطلبات
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/providers">ابحث عن مزود خدمة</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search className="size-5 text-primary" />
              <span className="text-slate-500">ابحث عن تصميم، تدريس، إدخال بيانات...</span>
            </div>
            <div className="mt-5 grid gap-3">
              {["تصميم صفحة هبوط", "مدرس لغة إنجليزية", "إدخال بيانات Excel"].map((item, index) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{item}</p>
                      <p className="mt-1 text-sm text-slate-500">طلب مفتوح · غزة</p>
                    </div>
                    <span
                      className={
                        index === 0
                          ? "rounded-full bg-accent-urgentBg px-3 py-1 text-xs font-bold text-accent-gold"
                          : "rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary-dark"
                      }
                    >
                      {index === 0 ? "عاجل" : "متاح"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
