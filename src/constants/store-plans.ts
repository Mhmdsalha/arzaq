import type { StorePlan } from "@prisma/client";

export type StorePlanConfig = {
  label: string;
  tagline: string;
  description: string;
  priceIls: number;
  listingLimit: number;
  recommended?: boolean;
};

export const storePlanOrder = ["GAZA", "MAJDAL", "QUDS"] as const satisfies readonly StorePlan[];

export const storePlans: Record<StorePlan, StorePlanConfig> = {
  GAZA: {
    label: "غزة",
    tagline: "للبداية الهادئة",
    description: "مناسبة للتجربة الأولى ونشر عدد محدود من الخدمات أو المنتجات.",
    priceIls: 0,
    listingLimit: 5,
  },
  MAJDAL: {
    label: "المجدل",
    tagline: "للمتاجر النشطة",
    description: "مساحة أكبر لعرض خدماتك ومنتجاتك بشكل احترافي.",
    priceIls: 15,
    listingLimit: 15,
    recommended: true,
  },
  QUDS: {
    label: "القدس",
    tagline: "للبائعين المحترفين",
    description: "لمن يريد بناء متجر واسع داخل أرزاق.",
    priceIls: 30,
    listingLimit: 30,
  },
};

export function getStorePlanConfig(plan: StorePlan): StorePlanConfig {
  return storePlans[plan] ?? storePlans.GAZA;
}

export function getStorePlanLimit(plan: StorePlan): number {
  return getStorePlanConfig(plan).listingLimit;
}

export function hasHigherStorePlan(currentPlan: StorePlan, targetPlan: StorePlan): boolean {
  return getStorePlanLimit(targetPlan) > getStorePlanLimit(currentPlan);
}

export function formatStorePlanPrice(priceIls: number): string {
  return priceIls === 0 ? "مجانية" : `${priceIls} شيكل`;
}
