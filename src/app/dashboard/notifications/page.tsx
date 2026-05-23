import { Bell } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getUserNotifications } from "@/services/navigation.service";

export const metadata = {
  title: "الإشعارات",
};

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const notifications = await getUserNotifications(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">الإشعارات</h1>
        <p className="mt-1 text-sm text-slate-600">آخر التحديثات والتنبيهات الخاصة بحسابك.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {notifications.length ? (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => (
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
              سنخبرك هنا عند وصول عروض أو تحديثات جديدة.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
