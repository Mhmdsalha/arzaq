import Link from "next/link";

import { requireAdmin } from "@/lib/authGuards";
import { getAuditLogs } from "@/services/audit.service";

type SearchParams = Promise<{
  action?: string;
  userId?: string;
  from?: string;
  to?: string;
  page?: string;
}>;

export default async function AdminAuditPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();

  const params = await searchParams;
  const data = await getAuditLogs({
    action: params.action,
    userId: params.userId,
    from: params.from,
    to: params.to,
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <section className="container-responsive py-10 text-white">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-emerald-300">مراقبة الأمان</p>
          <h1 className="mt-2 text-3xl font-bold">سجل التدقيق</h1>
          <p className="mt-2 text-sm text-slate-300">
            آخر العمليات الحساسة داخل النظام مع إمكانية التصفية.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 px-4 text-sm text-slate-200 hover:bg-white/10"
        >
          العودة للوحة الإدارة
        </Link>
      </div>

      <form className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-5">
        <select
          name="action"
          defaultValue={params.action ?? ""}
          className="h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-white"
        >
          <option value="">كل الإجراءات</option>
          {data.actions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
        <input
          name="userId"
          defaultValue={params.userId ?? ""}
          placeholder="معرّف المستخدم"
          className="h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-white placeholder:text-slate-500"
        />
        <input
          type="date"
          name="from"
          defaultValue={params.from ?? ""}
          className="h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-white"
        />
        <input
          type="date"
          name="to"
          defaultValue={params.to ?? ""}
          className="h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-white"
        />
        <button className="h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">
          تصفية
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-right text-sm">
            <thead className="bg-white/10 text-slate-200">
              <tr>
                <th className="px-4 py-3">الإجراء</th>
                <th className="px-4 py-3">المستخدم</th>
                <th className="px-4 py-3">النوع</th>
                <th className="px-4 py-3">المعرّف</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {data.logs.map((log) => (
                <tr key={log.id} className="text-slate-300">
                  <td className="px-4 py-3 font-semibold text-white">{log.action}</td>
                  <td className="px-4 py-3">{log.userId ?? "-"}</td>
                  <td className="px-4 py-3">{log.entityType ?? "-"}</td>
                  <td className="max-w-[220px] truncate px-4 py-3">{log.entityId ?? "-"}</td>
                  <td className="px-4 py-3">{log.ipAddress ?? "-"}</td>
                  <td className="px-4 py-3">{formatDate(log.createdAt)}</td>
                </tr>
              ))}
              {data.logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    لا توجد سجلات مطابقة.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
