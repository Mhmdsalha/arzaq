"use client";

import type { StorePlan } from "@prisma/client";
import { Check, Crown, Loader2, PackagePlus, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { requestStorePlanUpgradeAction } from "@/actions/store-plan.actions";
import { Button } from "@/components/ui/button";
import {
  formatStorePlanPrice,
  getStorePlanConfig,
  getStorePlanLimit,
  storePlanOrder,
  storePlans,
} from "@/constants/store-plans";
import { cn } from "@/lib/utils";
import type { SellerStoreStats } from "@/types/store";

type StorePlanCardProps = {
  stats: SellerStoreStats;
  className?: string;
};

export function StorePlanCard({ stats, className }: StorePlanCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const usedPercent = Math.min(Math.round((stats.billableListings / stats.planLimit) * 100), 100);
  const currentPlan = getStorePlanConfig(stats.storePlan);
  const isLimitReached = stats.remainingListings <= 0;

  return (
    <>
      <section
        className={cn(
          "overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-white to-emerald-50 p-4 shadow-sm lg:p-5",
          className,
        )}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                <Crown className="size-3.5" />
                باقة {currentPlan.label}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                {formatStorePlanPrice(currentPlan.priceIls)}
              </span>
            </div>
            <h2 className="mt-3 text-xl font-extrabold text-slate-950">استخدام عناصر المتجر</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              استخدمت {stats.billableListings} من {stats.planLimit} عنصر متاح في باقتك الحالية.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:min-w-56">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span>{usedPercent}% مستخدم</span>
              <span>{stats.remainingListings} متبقي</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white shadow-inner">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isLimitReached ? "bg-amber-500" : "bg-primary",
                )}
                style={{ width: `${usedPercent}%` }}
              />
            </div>
            <Button type="button" className="mt-2 h-11" onClick={() => setIsOpen(true)}>
              <PackagePlus className="size-4" />
              {isLimitReached ? "ترقية الباقة لإضافة المزيد" : "عرض الباقات"}
            </Button>
          </div>
        </div>
      </section>

      {isOpen ? (
        <StorePlanDialog currentPlan={stats.storePlan} onClose={() => setIsOpen(false)} />
      ) : null}
    </>
  );
}

function StorePlanDialog({
  currentPlan,
  onClose,
}: {
  currentPlan: StorePlan;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedPlan, setSelectedPlan] = useState<StorePlan | null>(null);

  function requestUpgrade(plan: StorePlan) {
    setSelectedPlan(plan);
    startTransition(async () => {
      const result = await requestStorePlanUpgradeAction(plan);

      if (result.ok) {
        toast.success(result.message);
        onClose();
        return;
      }

      toast.error(result.message);
      setSelectedPlan(null);
    });
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:items-center">
      <div
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl sm:rounded-3xl sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label="باقات المتجر"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-primary-dark">باقات متجر أرزاق</p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-950">
              اختر المساحة المناسبة لمتجرك
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              ابدأ مجاناً، وعندما يكبر متجرك أرسل طلب ترقية للإدارة لتفعيل الباقة المناسبة.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
            aria-label="إغلاق"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {storePlanOrder.map((plan) => {
            const config = storePlans[plan];
            const isCurrent = plan === currentPlan;
            const canRequest = getStorePlanLimit(plan) > getStorePlanLimit(currentPlan);
            const isLoading = isPending && selectedPlan === plan;

            return (
              <article
                key={plan}
                className={cn(
                  "relative rounded-3xl border p-5 transition",
                  config.recommended
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-slate-200 bg-white shadow-sm",
                )}
              >
                {config.recommended ? (
                  <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                    الأكثر توازناً
                  </span>
                ) : null}

                <p className="text-sm font-bold text-primary-dark">باقة {config.label}</p>
                <h3 className="mt-2 text-xl font-extrabold text-slate-950">{config.tagline}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
                  {config.description}
                </p>

                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <p className="text-3xl font-extrabold text-slate-950">{config.listingLimit}</p>
                  <p className="mt-1 text-sm text-slate-500">منتج أو خدمة</p>
                </div>

                <div className="mt-5 text-2xl font-extrabold text-slate-950">
                  {formatStorePlanPrice(config.priceIls)}
                </div>

                <ul className="mt-5 space-y-2 text-sm text-slate-600">
                  <Feature>عرض الخدمات والمنتجات بعد مراجعة الإدارة</Feature>
                  <Feature>إدارة الطلبات الواردة من لوحة المتجر</Feature>
                  <Feature>إظهار ليبل الباقة في البروفايل العام</Feature>
                </ul>

                <Button
                  type="button"
                  className="mt-6 h-11 w-full"
                  variant={isCurrent ? "secondary" : "default"}
                  disabled={isCurrent || !canRequest || isPending}
                  onClick={() => requestUpgrade(plan)}
                >
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                  {isCurrent ? "باقتك الحالية" : canRequest ? "طلب الاشتراك" : "ضمن باقتك الحالية"}
                </Button>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <Check className="size-4 shrink-0 text-primary" />
      <span>{children}</span>
    </li>
  );
}
