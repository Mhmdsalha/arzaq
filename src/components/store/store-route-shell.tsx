import Link from "next/link";

import { cn } from "@/lib/utils";

type StoreRouteShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
  children?: React.ReactNode;
  variant?: "public" | "dashboard" | "admin";
};

export function StoreRouteShell({
  eyebrow,
  title,
  description,
  backHref,
  backLabel = "رجوع",
  children,
  variant = "public",
}: StoreRouteShellProps) {
  const isAdmin = variant === "admin";

  return (
    <section className={cn(isAdmin ? "container-responsive py-10" : "space-y-6")}>
      <div
        className={cn(
          "rounded-3xl border p-6 shadow-sm",
          isAdmin
            ? "border-white/10 bg-white/5 text-white"
            : "border-slate-200 bg-white text-slate-950",
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className={cn("text-sm font-bold", isAdmin ? "text-primary-light" : "text-primary-dark")}>
              {eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h1>
            <p className={cn("mt-3 max-w-2xl text-sm leading-7", isAdmin ? "text-slate-300" : "text-slate-600")}>
              {description}
            </p>
          </div>

          {backHref ? (
            <Link
              href={backHref}
              className={cn(
                "inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition",
                isAdmin
                  ? "border border-white/10 text-slate-200 hover:bg-white/10"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-50",
              )}
            >
              {backLabel}
            </Link>
          ) : null}
        </div>

        <div
          className={cn(
            "mt-6 rounded-2xl border border-dashed p-5 text-sm leading-7",
            isAdmin ? "border-white/10 bg-slate-950/40 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600",
          )}
        >
          {children ?? (
            <p>
              تم تجهيز هذا المسار ضمن بنية المتجر. سيتم ربط البيانات والنماذج والإجراءات في المراحل التالية.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
