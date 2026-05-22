import { redirect } from "next/navigation";

import { JobPagination } from "@/components/jobs/job-pagination";
import { OffersList } from "@/components/offers/offers-list";
import { auth } from "@/lib/auth";
import { getUserOffers } from "@/services/offer.service";

export const metadata = {
  title: "عروضي",
};

export const dynamic = "force-dynamic";

export default async function DashboardOffersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const params = await searchParams;
  const page = Number(getSingleParam(params.page) ?? "1");
  const offers = await getUserOffers(session.user.id, Number.isFinite(page) ? page : 1);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary-dark">العروض المرسلة</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">عروضي</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          تابع العروض التي أرسلتها، عدّل العروض المعلقة، أو اسحبها قبل قبول صاحب الطلب.
        </p>
      </div>

      <OffersList variant="submitted" offers={offers.items} />

      {offers.items.length > 0 ? (
        <JobPagination currentPage={offers.page} totalPages={offers.totalPages} />
      ) : null}
    </div>
  );
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
