import { Bell } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { markAllNotificationsReadFormAction } from "@/actions/notification.actions";
import { NotificationsReadSync } from "@/components/dashboard/notifications-read-sync";
import { auth } from "@/lib/auth";
import {
  getUserNotifications,
  markUserNotificationsAsRead,
  type NotificationFilter,
} from "@/services/navigation.service";

export const metadata = {
  title: "الإشعارات",
};

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const params = await searchParams;
  const filter = getNotificationFilter(getSingleParam(params.filter));
  const notifications = await getUserNotifications(session.user.id, filter);
  await markUserNotificationsAsRead(session.user.id);

  return (
    <div className="space-y-6">
      <NotificationsReadSync />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">الإشعارات</h1>
          <p className="mt-1 text-sm text-slate-600">
            آخر التحديثات والتنبيهات الخاصة بحسابك. عند فتح الصفحة يتم تعليم الجديد كمقروء.
          </p>
        </div>
        <form action={markAllNotificationsReadFormAction}>
          <button className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
            تعليم الكل كمقروء
          </button>
        </form>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="كل الإشعارات" value={notifications.totalCount} />
        <SummaryCard label="كانت غير مقروءة" value={notifications.unreadCount} tone="red" />
        <SummaryCard label="المعروضة الآن" value={notifications.items.length} tone="green" />
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterLink href="/dashboard/notifications" active={filter === "all"}>
          الكل
        </FilterLink>
        <FilterLink href="/dashboard/notifications?filter=unread" active={filter === "unread"}>
          غير مقروءة
        </FilterLink>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {notifications.items.length ? (
          <div className="divide-y divide-slate-100">
            {notifications.items.map((notification) => (
              <Link
                key={notification.id}
                href={notification.link ?? "/dashboard"}
                className="flex items-start gap-3 p-4 transition hover:bg-slate-50"
              >
                <span className="mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-dark">
                  <Bell className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-slate-900">{notification.message}</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {notification.createdAt.toLocaleDateString("ar")}
                  </span>
                </span>
                {!notification.isRead ? (
                  <span className="mt-2 size-2 rounded-full bg-red-500" aria-label="غير مقروء" />
                ) : null}
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
            <Bell className="size-10 text-slate-300" />
            <h2 className="mt-3 font-bold text-slate-900">لا توجد إشعارات حتى الآن</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filter === "unread"
                ? "لا توجد إشعارات غير مقروءة حالياً."
                : "سنخبرك هنا عند وصول عروض أو تحديثات جديدة."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: number;
  tone?: "slate" | "red" | "green";
}) {
  const toneClass =
    tone === "red"
      ? "bg-red-50 text-red-700"
      : tone === "green"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-slate-50 text-slate-700";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 w-fit rounded-xl px-3 py-1 text-2xl font-bold ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-primary text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
      }`}
    >
      {children}
    </Link>
  );
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getNotificationFilter(value: string | undefined): NotificationFilter {
  return value === "unread" ? "unread" : "all";
}
