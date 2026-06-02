import { redirect } from "next/navigation";

import { DashboardOrdersList } from "@/components/store/dashboard-orders-list";
import { StoreRouteShell } from "@/components/store/store-route-shell";
import { auth } from "@/lib/auth";
import { getBuyerOrders } from "@/services/order.service";

export const metadata = {
  title: "طلباتي من المتجر",
};

export default async function DashboardOrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/dashboard/orders");
  }

  const orders = await getBuyerOrders(session.user.id);

  return (
    <StoreRouteShell
      eyebrow="طلبات المتجر"
      title="طلباتي كمشترٍ"
      description="تابع الطلبات التي أرسلتها على خدمات ومنتجات المتجر، وحالة كل طلب."
      backHref="/dashboard"
      backLabel="لوحة التحكم"
      variant="dashboard"
    >
      <DashboardOrdersList orders={orders} mode="buyer" />
    </StoreRouteShell>
  );
}
