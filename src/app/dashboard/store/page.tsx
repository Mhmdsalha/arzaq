import { redirect } from "next/navigation";

import { MyListingsList } from "@/components/store/my-listings-list";
import { DashboardOrdersList } from "@/components/store/dashboard-orders-list";
import { StoreRouteShell } from "@/components/store/store-route-shell";
import { auth } from "@/lib/auth";
import { getSellerListings, getSellerStoreStats } from "@/services/listing.service";
import { getReceivedOrders } from "@/services/order.service";

export const metadata = {
  title: "متجري",
};

export default async function DashboardStorePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/dashboard/store");
  }

  const [stats, listings, receivedOrders] = await Promise.all([
    getSellerStoreStats(session.user.id),
    getSellerListings(session.user.id),
    getReceivedOrders(session.user.id),
  ]);

  return (
    <StoreRouteShell
      eyebrow="لوحة التحكم"
      title="إدارة متجري"
      description="أدر خدماتك ومنتجاتك، وتابع الطلبات والمشاهدات وحالة كل عنصر من مكان واحد."
      backHref="/dashboard"
      backLabel="لوحة التحكم"
      variant="dashboard"
    >
      <div className="space-y-8">
        <MyListingsList stats={stats} listings={listings} />

        <section className="space-y-4">
          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
            <h2 className="text-xl font-extrabold text-slate-950">الطلبات الواردة</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              تابع طلبات العملاء على منتجاتك وخدماتك من نفس لوحة تحكم المتجر.
            </p>
          </div>
          <DashboardOrdersList orders={receivedOrders} mode="seller" />
        </section>
      </div>
    </StoreRouteShell>
  );
}
