import type { JobStatus } from "@/types/marketplace";

const statusConfig: Record<JobStatus | "URGENT", { label: string; className: string }> = {
  OPEN: { label: "مفتوح", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  IN_PROGRESS: { label: "قيد التنفيذ", className: "bg-blue-50 text-blue-700 border-blue-200" },
  COMPLETED: { label: "مكتمل", className: "bg-slate-100 text-slate-700 border-slate-200" },
  CANCELLED: { label: "ملغي", className: "bg-red-50 text-red-700 border-red-200" },
  URGENT: { label: "عاجل", className: "bg-accent-urgentBg text-accent-gold border-amber-200" },
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
