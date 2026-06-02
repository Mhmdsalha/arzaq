import { redirect } from "next/navigation";

import { DashboardOrdersList } from "@/components/store/dashboard-orders-list";
import { StoreRouteShell } from "@/components/store/store-route-shell";
import { auth } from "@/lib/auth";
import { getReceivedOrders } from "@/services/order.service";

export const metadata = {
  title: "الطلبات الواردة",
};

export default async function ReceivedOrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/dashboard/orders/received");
  }

  const orders = await getReceivedOrders(session.user.id);

  return (
    <StoreRouteShell
      eyebrow="طلبات المتجر"
      title="الطلبات الواردة كبائع"
      description="تابع طلبات العملاء على منتجاتك وخدماتك، وحدّث حالة كل طلب من نفس الصفحة."
      backHref="/dashboard/store"
      backLabel="العودة لمتجري"
      variant="dashboard"
    >
      <DashboardOrdersList orders={orders} mode="seller" />
    </StoreRouteShell>
  );
}
