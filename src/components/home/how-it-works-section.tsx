import { ClipboardList, MessageCircle, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "انشر طلبك",
    description:
      "اكتب الخدمة المطلوبة، المنطقة، الميزانية، وهل الطلب عاجل أو قابل للتنفيذ أونلاين.",
  },
  {
    icon: ShieldCheck,
    title: "راجع الملفات",
    description: "تصفح المهارات والتقييمات والأعمال السابقة واختر المزود الأنسب بثقة.",
  },
  {
    icon: MessageCircle,
    title: "تواصل عبر واتساب",
    description: "الاتفاق والتنفيذ يتمان خارج المنصة حاليًا، بدون دفع أو محادثة داخلية.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-slate-50 py-14">
      <div className="container space-y-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-slate-950">كيف تعمل أرزاق؟</h2>
          <p className="mt-2 text-slate-600">تجربة بسيطة مصممة للجوال وللسوق المحلي.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                key={step.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
                  <Icon className="size-6" />
                </div>
                <span className="mt-5 inline-block text-sm font-bold text-primary-dark">
                  خطوة {index + 1}
                </span>
                <h3 className="mt-2 text-xl font-bold text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{step.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
