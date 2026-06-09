"use client";

import { Edit, Eye, Loader2, PauseCircle, PlayCircle, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";

import {
  activateListingAction,
  deleteListingAction,
  pauseListingAction,
} from "@/actions/listing.actions";
import { Button } from "@/components/ui/button";
import { deliveryMethodLabels, listingStatusLabels, listingTypeLabels } from "@/constants/store";
import { regionLabels } from "@/constants/regions";
import { cn } from "@/lib/utils";
import type { ListingListItem, SellerStoreStats } from "@/types/store";
import { StorePlanCard } from "@/components/store/store-plan-card";

type MyListingsListProps = {
  listings: ListingListItem[];
  stats: SellerStoreStats;
};

export function MyListingsList({ listings, stats }: MyListingsListProps) {
  const canAddListing = stats.remainingListings > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatsCard label="العناصر النشطة" value={stats.activeListings} />
        <StatsCard label="كل العناصر" value={stats.totalListings} />
        <StatsCard label="طلبات واردة" value={stats.receivedOrders} />
        <StatsCard label="طلبات مكتملة" value={stats.completedOrders} />
        <StatsCard label="المشاهدات" value={stats.totalViews} />
      </div>

      <StorePlanCard stats={stats} />

      <div className="flex flex-col gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950">عناصر متجرك</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            أضف خدماتك أو منتجاتك، وتابع حالتها والطلبات الواردة عليها.
          </p>
        </div>
        {canAddListing ? (
          <Button asChild className="h-11">
            <Link href="/dashboard/store/new">
              <Plus className="size-4" />
              إضافة عنصر
            </Link>
          </Button>
        ) : (
          <Button type="button" className="h-11" disabled>
            وصلت إلى حد الباقة
          </Button>
        )}
      </div>

      {listings.length > 0 ? (
        <div className="grid gap-4">
          {listings.map((listing) => (
            <ListingRow key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <h3 className="text-lg font-bold text-slate-950">لا توجد عناصر في متجرك بعد</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            ابدأ بإضافة خدمة جاهزة أو منتج بسيط ليظهر في المتجر العام.
          </p>
          <Button asChild className="mt-5 h-11">
            <Link href="/dashboard/store/new">إضافة أول عنصر</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function ListingRow({ listing }: { listing: ListingListItem }) {
  const [isPending, startTransition] = useTransition();

  function runAction(action: "pause" | "activate" | "delete") {
    if (action === "delete" && !window.confirm("هل تريد حذف هذا العنصر؟ لا يمكن عرضه بعد الحذف.")) {
      return;
    }

    startTransition(async () => {
      const result =
        action === "pause"
          ? await pauseListingAction({ listingId: listing.id })
          : action === "activate"
            ? await activateListingAction({ listingId: listing.id })
            : await deleteListingAction({ listingId: listing.id });

      if (result.ok) {
        toast.success(result.message);
        return;
      }

      toast.error(result.message);
    });
  }

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold">
            <Badge className="bg-primary/10 text-primary-dark">
              {listingTypeLabels[listing.type]}
            </Badge>
            <Badge className={statusClassName(listing.status)}>
              {listingStatusLabels[listing.status]}
            </Badge>
            <Badge className="bg-slate-100 text-slate-600">{listing.category.name}</Badge>
          </div>
          <h3 className="line-clamp-1 text-lg font-extrabold text-slate-950">{listing.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
            {listing.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
            <span>{regionLabels[listing.region]}</span>
            <span>{deliveryMethodLabels[listing.deliveryMethod]}</span>
            <span>{formatPrice(listing.price)}</span>
            <span>{listing.ordersCount} طلب</span>
            <span>{listing.viewCount} مشاهدة</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {listing.status === "ACTIVE" ? (
            <Button asChild variant="secondary" className="h-10">
              <Link href={`/store/${listing.id}`}>
                <Eye className="size-4" />
                عرض
              </Link>
            </Button>
          ) : (
            <Button type="button" variant="secondary" className="h-10" disabled>
              <Eye className="size-4" />
              غير منشور
            </Button>
          )}
          <Button asChild variant="secondary" className="h-10">
            <Link href={`/dashboard/store/${listing.id}/edit`}>
              <Edit className="size-4" />
              تعديل
            </Link>
          </Button>
          {listing.status === "ACTIVE" ? (
            <Button
              type="button"
              variant="secondary"
              className="h-10"
              disabled={isPending}
              onClick={() => runAction("pause")}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <PauseCircle className="size-4" />
              )}
              إيقاف
            </Button>
          ) : listing.status === "PAUSED" || listing.status === "SOLD_OUT" ? (
            <Button
              type="button"
              variant="secondary"
              className="h-10"
              disabled={isPending}
              onClick={() => runAction("activate")}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <PlayCircle className="size-4" />
              )}
              تفعيل
            </Button>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            className="h-10 text-red-600"
            disabled={isPending}
            onClick={() => runAction("delete")}
          >
            <Trash2 className="size-4" />
            حذف
          </Button>
        </div>
      </div>
    </article>
  );
}

function StatsCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-slate-950">{value}</p>
    </div>
  );
}

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("rounded-full px-2.5 py-1", className)}>{children}</span>;
}

function statusClassName(status: ListingListItem["status"]) {
  if (status === "ACTIVE") {
    return "bg-green-50 text-green-700";
  }

  if (status === "PENDING_REVIEW") {
    return "bg-blue-50 text-blue-700";
  }

  if (status === "NEEDS_EDIT") {
    return "bg-amber-50 text-amber-700";
  }

  if (status === "REJECTED") {
    return "bg-red-50 text-red-700";
  }

  if (status === "SOLD_OUT") {
    return "bg-amber-50 text-amber-700";
  }

  if (status === "PAUSED") {
    return "bg-slate-100 text-slate-600";
  }

  return "bg-red-50 text-red-700";
}

function formatPrice(price: number) {
  return `${new Intl.NumberFormat("ar").format(price)} شيكل`;
}
