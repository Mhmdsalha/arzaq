import { CheckCircle2 } from "lucide-react";

import { CTASection } from "@/components/home/cta-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { PageHeader } from "@/components/shared/page-header";

const principles = [
  "لا توجد مدفوعات داخل المنصة في المرحلة الحالية.",
  "التواصل يتم عبر واتساب لتقليل التعقيد وتسريع الوصول.",
  "التقييمات والملفات المهنية تساعد في بناء الثقة تدريجيًا.",
  "الواجهة مصممة لتكون عربية، خفيفة، ومناسبة للجوال أولًا.",
];

export const metadata = {
  title: "كيف تعمل أرزاق",
};

export default function HowItWorksPage() {
  return (
    <main>
      <PageHeader
        title="كيف تعمل أرزاق؟"
        description="تجربة بسيطة تربط الطلبات بالمهارات المحلية بدون تعقيد تقني أو مالي."
        breadcrumbs={[{ label: "كيف تعمل" }]}
      />
      <HowItWorksSection />
      <section className="bg-white py-14">
        <div className="container">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-2xl font-bold text-slate-950">مبادئ المرحلة الأولى</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {principles.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm"
                >
                  <CheckCircle2 className="mt-1 size-5 shrink-0 text-primary" />
                  <p className="text-sm leading-7 text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <CTASection />
    </main>
  );
}
