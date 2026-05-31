import { createAdminAccountFormAction } from "@/actions/admin.actions";
import { getAdminAccounts } from "@/services/admin.service";

export const metadata = {
  title: "حسابات الإدارة",
};

export default async function AdminAccountsPage() {
  const admins = await getAdminAccounts();

  return (
    <section className="container-responsive py-10">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm font-semibold text-primary-light">إدارة الصلاحيات</p>
        <h1 className="mt-2 text-3xl font-bold text-white">حسابات الإدارة</h1>
        <p className="mt-2 text-sm leading-7 text-slate-300">
          أنشئ حسابات أدمن إضافية لإدارة المراجعة والتوثيق والبلاغات. استخدم بريداً
          مخصصاً لكل أدمن حتى تبقى العمليات قابلة للتتبع.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[420px_1fr]">
        <form
          action={createAdminAccountFormAction}
          className="rounded-2xl border border-white/10 bg-white/5 p-5"
        >
          <h2 className="text-xl font-bold text-white">إضافة أدمن جديد</h2>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm text-slate-200">
              الاسم
              <input
                required
                name="name"
                className="h-11 rounded-xl border border-white/10 bg-slate-900 px-4 text-white outline-none focus:border-primary"
              />
            </label>
            <label className="grid gap-1 text-sm text-slate-200">
              البريد الإلكتروني
              <input
                required
                name="email"
                type="email"
                className="h-11 rounded-xl border border-white/10 bg-slate-900 px-4 text-white outline-none focus:border-primary"
              />
            </label>
            <label className="grid gap-1 text-sm text-slate-200">
              رقم الجوال اختياري
              <input
                name="phone"
                className="h-11 rounded-xl border border-white/10 bg-slate-900 px-4 text-white outline-none focus:border-primary"
              />
            </label>
            <label className="grid gap-1 text-sm text-slate-200">
              كلمة المرور
              <input
                required
                name="password"
                type="password"
                minLength={8}
                dir="ltr"
                className="h-11 rounded-xl border border-white/10 bg-slate-900 px-4 text-left text-white outline-none focus:border-primary"
              />
            </label>
            <button className="mt-2 min-h-11 rounded-xl bg-primary px-5 font-semibold text-white hover:bg-primary-dark">
              إنشاء حساب أدمن
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-bold text-white">الأدمن الحاليون</h2>
          <div className="mt-4 grid gap-3">
            {admins.map((admin) => (
              <article key={admin.id} className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white">{admin.name}</h3>
                    <p className="mt-1 text-sm text-slate-300">
                      {admin.email ?? "لا يوجد بريد"} {admin.phone ? `· ${admin.phone}` : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200">
                    أدمن موثق
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
