import Link from "next/link";

import { getAdminOverview } from "@/services/admin.service";

const adminLinks = [
  { href: "/admin/users", label: "إدارة المستخدمين", description: "حظر، توثيق، ومراجعة الحسابات" },
  { href: "/admin/jobs", label: "إدارة الطلبات", description: "مراجعة الطلبات وإخفاء المخالف" },
  { href: "/admin/reports", label: "البلاغات", description: "متابعة بلاغات المستخدمين" },
  { href: "/admin/audit", label: "سجل التدقيق", description: "تتبع العمليات الحساسة" },
];

export default async function AdminPage() {
  const overview = await getAdminOverview();
  const stats = [
    { label: "المستخدمون", value: overview.totalUsers },
    { label: "أصحاب الطلبات", value: overview.clientUsers },
    { label: "مقدمو الخدمات", value: overview.providerUsers },
    { label: "الطلبات المفتوحة", value: overview.openJobs },
    { label: "بلاغات معلقة", value: overview.pendingReports },
    { label: "مقدمو خدمات موثقون", value: overview.trustedProviders },
    { label: "حسابات محظورة", value: overview.bannedUsers },
  ];

  return (
    <section className="container-responsive py-10">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
        <p className="text-sm font-semibold text-primary-light">أرزاق Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-white">لوحة الإدارة</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
          مركز مراقبة المنصة، مراجعة البلاغات، وإدارة الثقة والحسابات قبل الإطلاق.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-300">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-primary/60 hover:bg-primary/10"
          >
            <h2 className="text-xl font-bold text-white">{link.label}</h2>
            <p className="mt-2 text-sm text-slate-300">{link.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
