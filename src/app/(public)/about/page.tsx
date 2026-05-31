import { HeartHandshake, ShieldCheck, Smartphone } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { createPageMetadata } from "@/lib/seo";

const values = [
  {
    icon: HeartHandshake,
    title: "محلي أولًا",
    description: "نصمم حول احتياج أهل غزة، أصحاب الطلبات، الشباب، والخريجين الباحثين عن فرص.",
  },
  {
    icon: Smartphone,
    title: "خفيف على الجوال",
    description: "واجهة سريعة وواضحة على الشاشات الصغيرة والاتصالات محدودة السرعة.",
  },
  {
    icon: ShieldCheck,
    title: "ثقة تدريجية",
    description: "ملفات، تقييمات، أعمال سابقة وشارات موثوق تساعد في اختيار أفضل.",
  },
];

export const metadata = createPageMetadata({
  title: "عن أرزاق",
  description:
    "تعرف على أرزاق، منصة سوق العمل والخدمات المحلية في غزة التي تربط أصحاب الطلبات بمقدمي الخدمات بطريقة منظمة وموثوقة.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <main>
      <PageHeader
        title="عن أرزاق"
        description="أرزاق منصة سوق عمل وخدمات محلية، هدفها تسهيل الوصول بين الاحتياج والمهارة داخل غزة."
        breadcrumbs={[{ label: "عن أرزاق" }]}
      />
      <section className="container grid gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold leading-10 text-slate-950">
            نريد أن يصبح الوصول للرزق أسهل وأوضح.
          </h2>
          <p className="leading-8 text-slate-600">
            كثير من الفرص المحلية تبدأ برسالة واتساب أو توصية شخصية. أرزاق ينظم هذه التجربة: طلبات
            واضحة، ملفات مقدمي الخدمات، تقييمات، وتصنيفات تساعد الجميع في العثور على الشخص المناسب
            بسرعة.
          </p>
        </div>
        <div className="grid gap-4">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <article
                key={value.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
                    <Icon className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950">{value.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{value.description}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
