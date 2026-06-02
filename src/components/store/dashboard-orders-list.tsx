"use client";

import type { OrderStatus } from "@prisma/client";
import { Loader2, MessageCircle, PackageCheck, XCircle } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";

import { cancelOrderAction, updateOrderStatusAction } from "@/actions/order.actions";
import { ListingReviewButton } from "@/components/store/listing-review-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DashboardOrderItem } from "@/services/order.service";

const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: "Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„ØªØ£ÙƒÙŠØ¯",
  CONFIRMED: "Ù…Ø¤ÙƒØ¯",
  IN_PROGRESS: "Ù‚ÙŠØ¯ Ø§Ù„ØªÙ†ÙÙŠØ°",
  COMPLETED: "Ù…ÙƒØªÙ…Ù„",
  CANCELLED: "Ù…Ù„ØºÙŠ",
  DISPUTED: "Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©",
};

type DashboardOrdersListProps = {
  orders: DashboardOrderItem[];
  mode: "buyer" | "seller";
};

type SellerOrderUpdateStatus = "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export function DashboardOrdersList({ orders, mode }: DashboardOrdersListProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
        <h2 className="text-lg font-bold text-slate-950">
          {mode === "buyer" ? "Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª Ù…Ø±Ø³Ù„Ø© Ø¨Ø¹Ø¯" : "Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª ÙˆØ§Ø±Ø¯Ø© Ø¨Ø¹Ø¯"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {mode === "buyer"
            ? "ØªØµÙØ­ Ø§Ù„Ù…ØªØ¬Ø± ÙˆØ§Ø·Ù„Ø¨ Ø®Ø¯Ù…Ø© Ø£Ùˆ Ù…Ù†ØªØ¬Ø§Ù‹ Ù…Ù†Ø§Ø³Ø¨Ø§Ù‹."
            : "Ø¹Ù†Ø¯Ù…Ø§ ÙŠØ·Ù„Ø¨ Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡ Ø¹Ù†Ø§ØµØ± Ù…Ù† Ù…ØªØ¬Ø±Ùƒ Ø³ØªØ¸Ù‡Ø± Ù‡Ù†Ø§."}
        </p>
        <Button asChild className="mt-5 h-11">
          <Link href={mode === "buyer" ? "/store" : "/dashboard/store"}>
            {mode === "buyer" ? "ØªØµÙØ­ Ø§Ù„Ù…ØªØ¬Ø±" : "Ø¥Ø¯Ø§Ø±Ø© Ù…ØªØ¬Ø±ÙŠ"}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} mode={mode} />
      ))}
    </div>
  );
}

function OrderCard({ order, mode }: { order: DashboardOrderItem; mode: "buyer" | "seller" }) {
  const [isPending, startTransition] = useTransition();

  function cancel() {
    if (!window.confirm("Ù‡Ù„ ØªØ±ÙŠØ¯ Ø¥Ù„ØºØ§Ø¡ Ù‡Ø°Ø§ Ø§Ù„Ø·Ù„Ø¨ØŸ")) {
      return;
    }

    startTransition(async () => {
      const result = await cancelOrderAction({ orderId: order.id });
      result.ok ? toast.success(result.message) : toast.error(result.message);
    });
  }

  function update(status: SellerOrderUpdateStatus) {
    startTransition(async () => {
      const result = await updateOrderStatusAction({ orderId: order.id, status });
      result.ok ? toast.success(result.message) : toast.error(result.message);
    });
  }

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", statusClassName(order.status))}>
              {orderStatusLabels[order.status]}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
              Ø±Ù‚Ù… Ø§Ù„Ø·Ù„Ø¨: {order.id.slice(-8).toUpperCase()}
            </span>
          </div>
          <Link href={`/store/${order.listing.id}`}>
            <h2 className="line-clamp-1 text-lg font-extrabold text-slate-950 hover:text-primary-dark">
              {order.listing.title}
            </h2>
          </Link>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
            <span>Ø§Ù„ÙƒÙ…ÙŠØ©: {order.quantity}</span>
            <span>Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ: {formatPrice(order.totalPrice)}</span>
            <span>{formatDate(order.createdAt)}</span>
            {mode === "seller" && order.buyer ? <span>Ø§Ù„Ø¹Ù…ÙŠÙ„: {order.buyer.name}</span> : null}
            {mode === "buyer" && order.listing.seller ? <span>Ø§Ù„Ø¨Ø§Ø¦Ø¹: {order.listing.seller.name}</span> : null}
          </div>
          {order.note ? (
            <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
              {order.note}
            </p>
          ) : null}
          {order.address ? (
            <p className="mt-2 text-sm leading-6 text-slate-500">Ø§Ù„Ø¹Ù†ÙˆØ§Ù†: {order.address}</p>
          ) : null}
        </div>

        <div className="grid gap-2 sm:min-w-48">
          {mode === "buyer" && order.status === "PENDING" ? (
            <Button type="button" variant="secondary" className="h-10 text-red-600" disabled={isPending} onClick={cancel}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
              Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø·Ù„Ø¨
            </Button>
          ) : null}

          {mode === "buyer" && order.listing.seller?.whatsapp ? (
            <Button asChild variant="secondary" className="h-10 text-primary-dark">
              <a href={buildWhatsappUrl(order.listing.seller.whatsapp, order)} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" />
                ÙˆØ§ØªØ³Ø§Ø¨
              </a>
            </Button>
          ) : null}

          {mode === "buyer" && order.status === "COMPLETED" ? (
            order.review ? (
              <div className="rounded-xl bg-amber-50 px-3 py-2 text-center text-sm font-bold text-amber-700">
                تم التقييم: {order.review.rating}/5
              </div>
            ) : (
              <ListingReviewButton orderId={order.id} />
            )
          ) : null}
          {mode === "seller" ? (
            <SellerActions order={order} isPending={isPending} onUpdate={update} />
          ) : null}
        </div>
      </div>
    </article>
  );
}

function SellerActions({
  order,
  isPending,
  onUpdate,
}: {
  order: DashboardOrderItem;
  isPending: boolean;
  onUpdate: (status: SellerOrderUpdateStatus) => void;
}) {
  if (order.status === "PENDING") {
    return (
      <>
        <Button type="button" className="h-10" disabled={isPending} onClick={() => onUpdate("CONFIRMED")}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <PackageCheck className="size-4" />}
          ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø·Ù„Ø¨
        </Button>
        <Button type="button" variant="secondary" className="h-10 text-red-600" disabled={isPending} onClick={() => onUpdate("CANCELLED")}>
          Ø±ÙØ¶ Ø§Ù„Ø·Ù„Ø¨
        </Button>
      </>
    );
  }

  if (order.status === "CONFIRMED") {
    return (
      <>
        <Button type="button" className="h-10" disabled={isPending} onClick={() => onUpdate("IN_PROGRESS")}>
          Ø¨Ø¯Ø¡ Ø§Ù„ØªÙ†ÙÙŠØ°
        </Button>
        <Button type="button" variant="secondary" className="h-10 text-red-600" disabled={isPending} onClick={() => onUpdate("CANCELLED")}>
          Ø¥Ù„ØºØ§Ø¡
        </Button>
      </>
    );
  }

  if (order.status === "IN_PROGRESS") {
    return (
      <Button type="button" className="h-10" disabled={isPending} onClick={() => onUpdate("COMPLETED")}>
        ØªÙ… Ø§Ù„Ø¥Ù†Ø¬Ø§Ø²
      </Button>
    );
  }

  return null;
}

function statusClassName(status: OrderStatus) {
  if (status === "COMPLETED") {
    return "bg-green-50 text-green-700";
  }

  if (status === "CONFIRMED" || status === "IN_PROGRESS") {
    return "bg-blue-50 text-blue-700";
  }

  if (status === "CANCELLED" || status === "DISPUTED") {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-600";
}

function formatPrice(price: number) {
  return `${new Intl.NumberFormat("ar").format(price)} Ø´ÙŠÙƒÙ„`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
  }).format(date);
}

function buildWhatsappUrl(phone: string, order: DashboardOrderItem) {
  const text = `Ù…Ø±Ø­Ø¨Ø§Ù‹ØŒ Ø£ØªØ§Ø¨Ø¹ Ø·Ù„Ø¨ÙŠ Ø¹Ù„Ù‰ ${order.listing.title}. Ø±Ù‚Ù… Ø§Ù„Ø·Ù„Ø¨: ${order.id}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

