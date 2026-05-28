"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Edit, Eye, FileText, Trash2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { closeJobAction, deleteJobAction } from "@/actions/job.actions";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { regionLabels } from "@/constants/regions";
import type { UserJobItem } from "@/types/job";

export function MyJobsList({ jobs }: { jobs: UserJobItem[] }) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        title="لا توجد طلبات حتى الآن"
        description="ابدأ بنشر أول طلب ليظهر للمهنيين ومقدمي الخدمات."
        action={
          <Button asChild>
            <Link href="/dashboard/jobs/new">نشر طلب</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-right text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">العنوان</th>
              <th className="px-4 py-3 font-semibold">التصنيف</th>
              <th className="px-4 py-3 font-semibold">المنطقة</th>
              <th className="px-4 py-3 font-semibold">الحالة</th>
              <th className="px-4 py-3 font-semibold">العروض</th>
              <th className="px-4 py-3 font-semibold">المشاهدات</th>
              <th className="px-4 py-3 font-semibold">التاريخ</th>
              <th className="px-4 py-3 font-semibold">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="max-w-xs px-4 py-4 font-semibold text-slate-950">{job.title}</td>
                <td className="px-4 py-4 text-slate-600">{job.categoryName}</td>
                <td className="px-4 py-4 text-slate-600">{regionLabels[job.region]}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={job.isUrgent ? "URGENT" : job.status} />
                </td>
                <td className="px-4 py-4 text-slate-600">{job.offersCount}</td>
                <td className="px-4 py-4 text-slate-600">{job.views}</td>
                <td className="px-4 py-4 text-slate-600">
                  {format(job.createdAt, "d MMM yyyy", { locale: ar })}
                </td>
                <td className="px-4 py-4">
                  <JobRowActions job={job} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 lg:hidden">
        {jobs.map((job) => (
          <div key={job.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-950">{job.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {job.categoryName} · {regionLabels[job.region]}
                </p>
              </div>
              <StatusBadge status={job.isUrgent ? "URGENT" : job.status} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600">
              <span>العروض: {job.offersCount}</span>
              <span>المشاهدات: {job.views}</span>
            </div>
            <div className="mt-4">
              <JobRowActions job={job} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function JobRowActions({ job }: { job: UserJobItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const canEdit = ["OPEN", "PENDING_REVIEW", "NEEDS_EDIT"].includes(job.status);

  function runAction(type: "close" | "delete") {
    const message =
      type === "close"
        ? "هل تريد إغلاق هذا الطلب؟ لن يتمكن المستخدمون من التقديم عليه."
        : "هل تريد حذف هذا الطلب؟ سيتم إخفاؤه من المنصة.";

    if (!window.confirm(message)) {
      return;
    }

    startTransition(async () => {
      const result =
        type === "close" ? await closeJobAction(job.id) : await deleteJobAction(job.id);

      if (result.ok) {
        toast.success(result.message);
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild variant="secondary" size="sm">
        <Link href={`/jobs/${job.id}`}>
          <Eye className="size-4" />
          عرض
        </Link>
      </Button>
      {canEdit ? (
        <Button asChild variant="secondary" size="sm">
          <Link href={`/dashboard/jobs/${job.id}/edit`}>
            <Edit className="size-4" />
            تعديل
          </Link>
        </Button>
      ) : null}
      {job.offersCount > 0 ? (
        <Button asChild variant="secondary" size="sm">
          <Link href={`/dashboard/jobs/${job.id}/offers`}>
            <FileText className="size-4" />
            عروض المتقدمين
          </Link>
        </Button>
      ) : null}
      {canEdit ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isPending}
          onClick={() => runAction("close")}
        >
          <XCircle className="size-4" />
          إغلاق
        </Button>
      ) : null}
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={isPending}
        onClick={() => runAction("delete")}
      >
        <Trash2 className="size-4" />
        حذف
      </Button>
    </div>
  );
}
