import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-slate-50 px-4 py-16 text-center">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-bold text-primary">404</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-950">الصفحة غير موجودة</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          الرابط الذي تحاول الوصول إليه غير متاح أو ربما تم نقله.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-dark"
        >
          العودة للرئيسية
        </Link>
      </div>
    </main>
  );
}
