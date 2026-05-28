import { PageHeader } from "@/components/shared/page-header";

export const metadata = {
  title: "شروط الاستخدام",
};

export default function TermsPage() {
  return (
    <main>
      <PageHeader title="شروط الاستخدام" breadcrumbs={[{ label: "شروط الاستخدام" }]} />
      <section className="container-responsive py-10">
        <article className="prose prose-slate max-w-none rounded-3xl border border-slate-200 bg-white p-6 leading-8 shadow-sm">
          <h2>طبيعة المنصة</h2>
          <p>
            أرزاق منصة محلية تربط أصحاب الطلبات بمقدمي الخدمات. لا تدير المنصة المدفوعات
            أو الاتفاقات المالية، ويتم التواصل والتنفيذ خارج المنصة حالياً.
          </p>
          <h2>التزامات المستخدم</h2>
          <p>
            يلتزم المستخدم بتقديم بيانات صحيحة، واحترام الآخرين، وعدم نشر محتوى مضلل أو
            مسيء أو مخالف للقانون أو الأعراف العامة.
          </p>
          <h2>التعاملات خارج المنصة</h2>
          <p>
            أي اتفاق مالي أو تنفيذ خدمة يتم بين المستخدمين مباشرة. ننصح بالتحقق من الطرف
            الآخر واستخدام البلاغات عند وجود مخالفة.
          </p>
          <h2>إيقاف الحسابات</h2>
          <p>
            يحق لإدارة أرزاق تعليق أو حظر الحسابات التي تخالف شروط الاستخدام أو تضر
            بالمجتمع.
          </p>
        </article>
      </section>
    </main>
  );
}
