import { redirect } from "next/navigation";

import { MyListingsList } from "@/components/store/my-listings-list";
import { StoreRouteShell } from "@/components/store/store-route-shell";
import { auth } from "@/lib/auth";
import { getSellerListings, getSellerStoreStats } from "@/services/listing.service";

export const metadata = {
  title: "متجري",
};

export default async function DashboardStorePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/dashboard/store");
  }

  const [stats, listings] = await Promise.all([
    getSellerStoreStats(session.user.id),
    getSellerListings(session.user.id),
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
      <MyListingsList stats={stats} listings={listings} />
    </StoreRouteShell>
  );
}
