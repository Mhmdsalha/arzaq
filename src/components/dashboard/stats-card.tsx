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
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
      <div className="flex items-start justify-between gap-2 lg:gap-4">
        <div
          className={cn("flex size-10 items-center justify-center rounded-2xl lg:size-12", toneClasses[tone])}
        >
          <Icon className="size-5 lg:size-6" />
        </div>
        <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-500 lg:px-3 lg:text-xs">
          {trend}
        </span>
      </div>
      <p className="mt-4 text-xs font-medium leading-relaxed text-slate-500 lg:mt-5 lg:text-sm">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">{value.toLocaleString("ar")}</p>
    </article>
  );
}
