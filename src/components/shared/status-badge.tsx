import type { JobStatus } from "@/types/marketplace";

const statusConfig: Record<JobStatus | "URGENT", { label: string; className: string }> = {
  PENDING_REVIEW: {
    label: "قيد المراجعة",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  NEEDS_EDIT: {
    label: "يحتاج تعديلات",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
  OPEN: { label: "مفتوح", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  IN_PROGRESS: { label: "مغلق", className: "border-slate-200 bg-slate-100 text-slate-700" },
  COMPLETED: { label: "مغلق", className: "border-slate-200 bg-slate-100 text-slate-700" },
  CANCELLED: { label: "مغلق", className: "border-red-200 bg-red-50 text-red-700" },
  URGENT: { label: "عاجل", className: "border-amber-200 bg-accent-urgentBg text-accent-gold" },
};

export function StatusBadge({ status }: { status: JobStatus | "URGENT" }) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
