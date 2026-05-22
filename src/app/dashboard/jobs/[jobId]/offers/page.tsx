import Link from "next/link";
import { redirect } from "next/navigation";

import { OffersList } from "@/components/offers/offers-list";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getJobOffers } from "@/services/offer.service";

export const metadata = {
  title: "عروض المتقدمين",
};

export const dynamic = "force-dynamic";

export default async function DashboardJobOffersPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { jobId } = await params;
  const data = await getJobOffers(jobId, session.user.id);

  if (!data) {
    redirect("/dashboard/jobs");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary-dark">عروض المتقدمين</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">{data.job.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={data.job.status} />
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {data.job.offersCount} عروض
              </span>
            </div>
          </div>
          <Button asChild variant="secondary">
            <Link href={`/jobs/${data.job.id}`}>عرض الطلب</Link>
          </Button>
        </div>
      </div>

      <OffersList variant="received" offers={data.offers} jobId={data.job.id} />
    </div>
  );
}
