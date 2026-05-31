import { PageHeader } from "@/components/shared/page-header";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "إرشادات السلامة",
  description:
    "إرشادات لحماية المستخدمين عند نشر الطلبات، تقديم العروض، التواصل عبر واتساب، الاتفاق المالي والإبلاغ عن المخالفات.",
  path: "/safety",
});

export default function SafetyPage() {
  return (
    <main>
      <PageHeader title="إرشادات السلامة" breadcrumbs={[{ label: "إرشادات السلامة" }]} />
      <section className="container-responsive py-10">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              title: "تحقق قبل الاتفاق",
              body: "راجع البروفايل، التقييمات، وطبيعة الطلب قبل مشاركة أي معلومات حساسة.",
            },
            {
              title: "لا تدفع بدون وضوح",
              body: "اتفق على السعر والمدة والتسليم بوضوح قبل بدء العمل، وتجنب الدفع المسبق غير الموثوق.",
            },
            {
              title: "استخدم البلاغات",
              body: "إذا لاحظت احتيالاً أو محتوى مخالفاً، أرسل بلاغاً ليتم مراجعته من الإدارة.",
            },
            {
              title: "احمِ بياناتك",
              body: "لا تشارك كلمات المرور أو رموز التوثيق أو معلومات شخصية غير ضرورية.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-950">{item.title}</h2>
              <p className="mt-3 leading-8 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
