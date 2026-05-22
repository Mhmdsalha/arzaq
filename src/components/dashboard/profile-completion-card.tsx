import { CheckCircle2, Circle, UserRoundPen } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { ProfileCompletionData } from "@/types/dashboard";

export function ProfileCompletionCard({ completion }: { completion: ProfileCompletionData }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">اكتمال البروفايل</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            كلما اكتمل ملفك زادت ثقة أصحاب الطلبات بك.
          </p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary-dark">
          <UserRoundPen className="size-5" />
        </span>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-700">نسبة الاكتمال</span>
          <span className="font-bold text-primary-dark">{completion.percent}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${completion.percent}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {completion.checks.map((check) => (
          <div key={check.key} className="flex items-center gap-2 text-sm">
            {check.isComplete ? (
              <CheckCircle2 className="size-5 text-primary" />
            ) : (
              <Circle className="size-5 text-slate-300" />
            )}
            <span className={check.isComplete ? "font-medium text-slate-700" : "text-slate-500"}>
              {check.label}
            </span>
          </div>
        ))}
      </div>

      {completion.percent < 100 ? (
        <Button asChild className="mt-5 w-full">
          <Link href="/dashboard/profile">أكمل البروفايل</Link>
        </Button>
      ) : (
        <div className="mt-5 rounded-xl bg-primary/10 p-3 text-center text-sm font-semibold text-primary-dark">
          بروفايلك مكتمل وجاهز للظهور بثقة.
        </div>
      )}
    </section>
  );
}
