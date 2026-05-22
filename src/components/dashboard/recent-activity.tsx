import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { MessageSquareMore, Send, Star } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import type { DashboardActivityItem } from "@/types/dashboard";

const activityConfig = {
  JOB_POSTED: {
    icon: MessageSquareMore,
    className: "bg-primary/10 text-primary-dark",
  },
  OFFER_SENT: {
    icon: Send,
    className: "bg-blue-50 text-blue-700",
  },
  REVIEW_RECEIVED: {
    icon: Star,
    className: "bg-amber-50 text-amber-700",
  },
};

export function RecentActivity({ activities }: { activities: DashboardActivityItem[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">آخر النشاطات</h2>
          <p className="mt-1 text-sm text-slate-500">آخر 5 تحركات مرتبطة بحسابك.</p>
        </div>
      </div>

      {activities.length > 0 ? (
        <div className="grid gap-3">
          {activities.map((activity) => {
            const config = activityConfig[activity.type];
            const Icon = config.icon;

            return (
              <Link
                key={activity.id}
                href={activity.href}
                className="flex items-start gap-3 rounded-2xl border border-slate-100 p-3 transition hover:bg-slate-50"
              >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${config.className}`}
                >
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-slate-950">{activity.title}</span>
                  <span className="mt-1 line-clamp-1 block text-sm text-slate-600">
                    {activity.description}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-slate-400">
                  {formatDistanceToNow(activity.createdAt, { addSuffix: true, locale: ar })}
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="لا يوجد نشاط بعد"
          description="ابدأ بنشر طلب أو تقديم عرض لتظهر نشاطاتك هنا."
        />
      )}
    </section>
  );
}
