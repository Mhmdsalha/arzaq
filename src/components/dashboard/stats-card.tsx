import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  tone = "green",
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  trend: string;
  tone?: "green" | "blue" | "amber" | "slate";
}) {
  const toneClasses = {
    green: "bg-primary/10 text-primary-dark",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn("flex size-12 items-center justify-center rounded-2xl", toneClasses[tone])}
        >
          <Icon className="size-6" />
        </div>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
          {trend}
        </span>
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value.toLocaleString("ar")}</p>
    </article>
  );
}
