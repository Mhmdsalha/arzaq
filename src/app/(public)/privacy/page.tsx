import { PageHeader } from "@/components/shared/page-header";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "سياسة الخصوصية",
  description:
    "تعرف على طريقة جمع واستخدام وحماية بيانات المستخدمين في منصة أرزاق، بما يشمل الحسابات، البروفايلات، رموز التوثيق والتواصل.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <main>
      <PageHeader title="سياسة الخصوصية" breadcrumbs={[{ label: "سياسة الخصوصية" }]} />
      <section className="container-responsive py-10">
        <article className="prose prose-slate max-w-none rounded-3xl border border-slate-200 bg-white p-6 leading-8 shadow-sm">
          <h2>البيانات التي نجمعها</h2>
          <p>
            نجمع بيانات الحساب الأساسية مثل الاسم، البريد الإلكتروني، رقم الجوال، المنطقة، صورة
            البروفايل، المهارات، وروابط الأعمال عند إضافتها.
          </p>
          <h2>لماذا نستخدم البيانات؟</h2>
          <p>
            نستخدم البيانات لإنشاء الحساب، عرض البروفايل، تسهيل التواصل، تحسين تجربة البحث، إرسال
            رموز التوثيق، وحماية المنصة من الإساءة.
          </p>
          <h2>مشاركة البيانات</h2>
          <p>
            لا نبيع بيانات المستخدمين. قد تظهر بعض بيانات البروفايل العامة مثل الاسم والمنطقة
            والمهارات والتقييمات لمستخدمي المنصة.
          </p>
          <h2>حذف البيانات</h2>
          <p>يمكن للمستخدم طلب حذف بياناته لاحقاً عبر قنوات التواصل الرسمية للمنصة.</p>
        </article>
      </section>
    </main>
  );
}
