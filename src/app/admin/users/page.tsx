import type { AccountType } from "@prisma/client";
import Link from "next/link";

import {
  setProviderTrustFormAction,
  setUserBanFormAction,
  setUserVerifiedFormAction,
} from "@/actions/admin.actions";
import { regionLabels } from "@/constants/regions";
import { getAdminUsers } from "@/services/admin.service";

const accountTypeLabels: Record<AccountType, string> = {
  CLIENT: "صاحب طلب",
  PROVIDER: "مقدم خدمة",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = getParam(params.q);
  const accountType = parseAccountType(getParam(params.accountType));
  const page = Number(getParam(params.page) ?? "1");
  const data = await getAdminUsers({ q, accountType, page });

  return (
    <section className="container-responsive py-10">
      <Header title="إدارة المستخدمين" backHref="/admin" />
      <form className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_220px_auto]">
        <input
          name="q"
          defaultValue={q}
          placeholder="بحث بالاسم أو البريد أو الجوال"
          className="h-11 rounded-xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
        />
        <select
          name="accountType"
          defaultValue={accountType ?? ""}
          className="h-11 rounded-xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
        >
          <option value="">كل الأنواع</option>
          <option value="CLIENT">أصحاب الطلبات</option>
          <option value="PROVIDER">مقدمو الخدمات</option>
        </select>
        <button className="min-h-11 rounded-xl bg-primary px-5 font-semibold text-white">
          بحث
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="grid gap-4 p-4">
          {data.users.map((user) => (
            <article key={user.id} className="rounded-2xl border border-white/10 bg-slate-900 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{user.name}</h2>
                    <span className="rounded-full bg-primary/15 px-3 py-1 text-xs text-primary-light">
                      {accountTypeLabels[user.accountType]}
                    </span>
                    {user.isVerified ? (
                      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200">
                        موثق البريد
                      </span>
                    ) : null}
                    {user.isBanned ? (
                      <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs text-red-200">
                        محظور
                      </span>
                    ) : null}
                    {user.profile?.isTrusted ? (
                      <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs text-blue-200">
                        موثق خدمة
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    {user.email ?? "لا يوجد بريد"} · {user.phone ?? "لا يوجد جوال"} ·{" "}
                    {user.profile?.region ? regionLabels[user.profile.region] : "منطقة غير محددة"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    تقييم {user.profile?.avgRating.toFixed(1) ?? "0.0"} من{" "}
                    {user.profile?.totalReviews ?? 0} مراجعة
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={setUserBanFormAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="isBanned" value={String(!user.isBanned)} />
                    <button className="min-h-10 rounded-xl bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15">
                      {user.isBanned ? "فك الحظر" : "حظر"}
                    </button>
                  </form>
                  <form action={setUserVerifiedFormAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="isVerified" value={String(!user.isVerified)} />
                    <button className="min-h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">
                      {user.isVerified ? "إلغاء توثيق الحساب" : "توثيق الحساب"}
                    </button>
                  </form>
                  {user.accountType === "PROVIDER" ? (
                    <form action={setProviderTrustFormAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="isTrusted" value={String(!user.profile?.isTrusted)} />
                      <button className="min-h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">
                        {user.profile?.isTrusted ? "إلغاء التوثيق" : "توثيق"}
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Header({ title, backHref }: { title: string; backHref: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      <Link href={backHref} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200">
        رجوع
      </Link>
    </div>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseAccountType(value: string | undefined): AccountType | undefined {
  return value === "CLIENT" || value === "PROVIDER" ? value : undefined;
}
