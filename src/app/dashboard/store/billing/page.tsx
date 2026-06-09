import type { StorePlan } from "@prisma/client";
import { redirect } from "next/navigation";

import { StorePlanPaymentForm } from "@/components/store/store-plan-payment-form";
import { StoreRouteShell } from "@/components/store/store-route-shell";
import { auth } from "@/lib/auth";
import { getStorePlanCheckout, isPaidStorePlan } from "@/services/store-plan.service";

export const metadata = {
  title: "دفع باقة المتجر",
};

export default async function StoreBillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/dashboard/store/billing");
  }

  const params = await searchParams;
  const targetPlan = parseTargetPlan(getParam(params.plan));

  if (!targetPlan || !isPaidStorePlan(targetPlan)) {
    redirect("/dashboard/store");
  }

  let checkout: Awaited<ReturnType<typeof getStorePlanCheckout>>;

  try {
    checkout = await getStorePlanCheckout(session.user.id, targetPlan);
  } catch {
    redirect("/dashboard/store");
  }

  return (
    <StoreRouteShell
      eyebrow="دفع يدوي"
      title={`الاشتراك في باقة ${checkout.targetPlanConfig.label}`}
      description="حوّل قيمة الباقة عبر إحدى طرق الدفع، ثم ارفع إشعار الدفع ليتم تفعيل الباقة بعد مراجعة الإدارة."
      backHref="/dashboard/store"
      backLabel="العودة لمتجري"
      variant="dashboard"
    >
      <StorePlanPaymentForm targetPlan={targetPlan} pendingRequest={checkout.pendingRequest} />
    </StoreRouteShell>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseTargetPlan(value: string | undefined): StorePlan | null {
  return value === "MAJDAL" || value === "QUDS" ? value : null;
}
