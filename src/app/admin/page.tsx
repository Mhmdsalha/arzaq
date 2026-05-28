import Link from "next/link";

export default function AdminPage() {
  return (
    <section className="container-responsive py-10">
      <h1 className="text-2xl font-bold">لوحة الإدارة</h1>
      <p className="mt-2 text-slate-300">أدوات الإدارة والمراقبة الخاصة بمنصة أرزاق.</p>
      <Link
        href="/admin/audit"
        className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-dark"
      >
        سجل التدقيق الأمني
      </Link>
    </section>
  );
}
