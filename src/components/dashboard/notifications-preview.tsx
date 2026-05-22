import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Bell } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import type { DashboardNotificationItem } from "@/types/dashboard";

export function NotificationsPreview({
  notifications,
}: {
  notifications: DashboardNotificationItem[];
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">التنبيهات</h2>
          <p className="mt-1 text-sm text-slate-500">الأحدث وغير المقروء أولًا.</p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary-dark">
          <Bell className="size-5" />
        </span>
      </div>

      {notifications.length > 0 ? (
        <div className="grid gap-3">
          {notifications.map((notification) => {
            const content = (
              <span className="flex items-start gap-3 rounded-2xl border border-slate-100 p-3 transition hover:bg-slate-50">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 block text-sm font-semibold leading-6 text-slate-800">
                    {notification.message}
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">
                    {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: ar })}
                  </span>
                </span>
              </span>
            );

            return notification.link ? (
              <Link key={notification.id} href={notification.link}>
                {content}
              </Link>
            ) : (
              <div key={notification.id}>{content}</div>
            );
          })}
        </div>
      ) : (
        <EmptyState title="لا توجد تنبيهات" description="عندما تصلك عروض أو تحديثات ستظهر هنا." />
      )}
    </section>
  );
}
