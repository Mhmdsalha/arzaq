import Link from "next/link";

import { getAdminHref } from "@/lib/admin-path";
import { getAdminOverview, getAdminQueueSnapshot } from "@/services/admin.service";

const adminLinks = [
  {
    href: getAdminHref("/admins"),
    label: "حسابات الإدارة",
    description: "إضافة حسابات أدمن جديدة وإدارة دخول الفريق.",
  },
  {
    href: getAdminHref("/users"),
    label: "إدارة المستخدمين",
    description: "حظر، توثيق، ومراجعة حسابات أصحاب الطلبات ومقدمي الخدمات.",
  },
  {
    href: getAdminHref("/verification"),
    label: "طلبات التوثيق",
    description: "مراجعة طلبات التوثيق الرسمي لمقدمي الخدمات المؤهلين.",
  },
  {
    href: getAdminHref("/jobs"),
    label: "مراجعة الطلبات",
    description: "اعتماد الطلبات الجديدة أو إرجاعها للعميل للتعديل قبل النشر.",
  },
  {
    href: getAdminHref("/reports"),
    label: "البلاغات",
    description: "متابعة بلاغات المستخدمين والتعامل مع المحتوى المخالف.",
  },
  {
    href: getAdminHref("/audit"),
    label: "سجل التدقيق",
    description: "تتبع العمليات الحساسة داخل المنصة.",
  },
];

export default async function AdminPage() {
  const [overview, queue] = await Promise.all([getAdminOverview(), getAdminQueueSnapshot()]);
  const urgentCount =
    overview.pendingJobs + overview.pendingVerificationRequests + overview.pendingReports;
  const stats = [
    { label: "المستخدمون", value: overview.totalUsers },
    { label: "أصحاب الطلبات", value: overview.clientUsers },
    { label: "مقدمو الخدمات", value: overview.providerUsers },
    { label: "الطلبات المفتوحة", value: overview.openJobs },
    { label: "طلبات بانتظار المراجعة", value: overview.pendingJobs },
    { label: "طلبات توثيق معلقة", value: overview.pendingVerificationRequests },
    { label: "بلاغات معلقة", value: overview.pendingReports },
    { label: "مقدمو خدمات موثقون", value: overview.trustedProviders },
    { label: "حسابات محظورة", value: overview.bannedUsers },
  ];

  return (
    <section className="container-responsive py-10">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-primary/10 p-6 shadow-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary-light">أرزاق Admin</p>
            <h1 className="mt-2 text-3xl font-bold text-white">لوحة الإدارة</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
              مركز مراقبة المنصة ومراجعة الطلبات والتوثيق والبلاغات قبل الإطلاق.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-amber-100">
            <p className="text-sm">مهام تحتاج مراجعة</p>
            <p className="mt-1 text-4xl font-bold">{urgentCount}</p>
          </div>
        </div>
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

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <QueueCard
          title="طلبات بانتظار المراجعة"
          href={getAdminHref("/jobs?status=PENDING_REVIEW")}
          empty="لا توجد طلبات جديدة."
          items={queue.pendingJobs.map((job) => ({
            id: job.id,
            title: job.title,
            meta: `${job.code} · ${job.author.name}`,
            href: getAdminHref(`/jobs/${job.id}`),
          }))}
        />
        <QueueCard
          title="طلبات توثيق معلقة"
          href={getAdminHref("/verification?status=PENDING")}
          empty="لا توجد طلبات توثيق."
          items={queue.verificationRequests.map((request) => ({
            id: request.id,
            title: request.provider.name,
            meta: `${request.provider.profile?.avgRating.toFixed(1) ?? "0.0"} تقييم · ${
              request.provider.profile?.totalReviews ?? 0
            } مراجعة`,
            href: getAdminHref("/verification?status=PENDING"),
          }))}
        />
        <QueueCard
          title="بلاغات معلقة"
          href={getAdminHref("/reports?status=PENDING")}
          empty="لا توجد بلاغات معلقة."
          items={queue.pendingReports.map((report) => ({
            id: report.id,
            title: report.reason,
            meta: `${report.reporter.name} · ${report.targetType}`,
            href: getAdminHref("/reports?status=PENDING"),
          }))}
        />
      </div>
    </section>
  );
}

function QueueCard({
  title,
  href,
  empty,
  items,
}: {
  title: string;
  href: string;
  empty: string;
  items: Array<{ id: string; title: string; meta: string; href: string }>;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <Link href={href} className="text-sm font-semibold text-primary-light hover:text-white">
          عرض الكل
        </Link>
      </div>
      <div className="mt-4 space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="block rounded-xl border border-white/10 bg-slate-950 p-3 transition hover:border-primary/50"
            >
              <p className="line-clamp-1 font-semibold text-white">{item.title}</p>
              <p className="mt-1 line-clamp-1 text-xs text-slate-400">{item.meta}</p>
            </Link>
          ))
        ) : (
          <p className="rounded-xl border border-white/10 bg-slate-950 p-4 text-sm text-slate-400">
            {empty}
          </p>
        )}
      </div>
    </section>
  );
}
