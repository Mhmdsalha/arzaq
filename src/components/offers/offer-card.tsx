"use client";

import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Check, Clock, Edit, ShieldCheck, Star, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import { acceptOfferAction, rejectOfferAction, withdrawOfferAction } from "@/actions/offer.actions";
import { OfferForm } from "@/components/offers/offer-form";
import { OfferStatusBadge } from "@/components/offers/offer-status-badge";
import { ReviewForm } from "@/components/reviews/review-form";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Button } from "@/components/ui/button";
import { regionLabels } from "@/constants/regions";
import { refreshNavigationSummary } from "@/hooks/useUnreadCount";
import type { ReceivedOfferItem, UserOfferItem } from "@/types/offer";

export function OfferCard(
  props:
    | { variant: "submitted"; offer: UserOfferItem }
    | { variant: "received"; offer: ReceivedOfferItem; jobId: string },
) {
  if (props.variant === "submitted") {
    return <SubmittedOfferCard offer={props.offer} />;
  }

  return <ReceivedOfferCard offer={props.offer} jobId={props.jobId} />;
}

function SubmittedOfferCard({ offer }: { offer: UserOfferItem }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function withdraw() {
    if (!window.confirm("هل تريد سحب هذا العرض؟")) {
      return;
    }

    startTransition(async () => {
      const result = await withdrawOfferAction(offer.id);

      if (result.ok) {
        toast.success(result.message);
        refreshNavigationSummary();
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <OfferStatusBadge status={offer.status} />
          <h2 className="mt-3 text-lg font-bold text-slate-950">
            <Link href={`/jobs/${offer.job.id}`}>{offer.job.title}</Link>
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {offer.job.categoryName} · {regionLabels[offer.job.region]}
          </p>
        </div>
        <p className="flex items-center gap-1 text-sm text-slate-500">
          <Clock className="size-4" />
          {formatDistanceToNow(offer.createdAt, { addSuffix: true, locale: ar })}
        </p>
      </div>

      {isEditing ? (
        <div className="mt-4">
          <OfferForm
            mode="edit"
            offerId={offer.id}
            jobPostId={offer.job.id}
            defaults={{
              message: offer.message,
              price: offer.price,
              duration: offer.duration,
            }}
            onDone={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">{offer.message}</p>
      )}

      <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
        <span>السعر: {offer.price}</span>
        <span>المدة: {offer.duration}</span>
      </div>

      {offer.status === "ACCEPTED" ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          تم قبول عرضك. يمكنك التواصل مع صاحب الطلب الآن.
        </div>
      ) : null}

      {offer.status === "ACCEPTED" && !offer.reviewedByCurrentUser ? (
        <ReviewForm
          receiverId={offer.job.ownerId}
          jobPostId={offer.job.id}
          receiverName="صاحب الطلب"
        />
      ) : null}

      {offer.status === "ACCEPTED" && offer.reviewedByCurrentUser ? (
        <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-600">
          تم إرسال تقييمك لهذا الطلب.
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {offer.status === "PENDING" ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing((value) => !value)}
            >
              <Edit className="size-4" />
              {isEditing ? "إغلاق التعديل" : "تعديل العرض"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={withdraw}
            >
              <Trash2 className="size-4" />
              سحب العرض
            </Button>
          </>
        ) : null}

        {offer.status === "ACCEPTED" && offer.job.ownerWhatsapp ? (
          <WhatsAppButton phone={offer.job.ownerWhatsapp} label="واتساب صاحب الطلب" />
        ) : null}
      </div>
    </article>
  );
}

function ReceivedOfferCard({ offer, jobId }: { offer: ReceivedOfferItem; jobId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<"accept" | "reject" | null>(null);

  function runAction(type: "accept" | "reject") {
    startTransition(async () => {
      const result =
        type === "accept" ? await acceptOfferAction(offer.id) : await rejectOfferAction(offer.id);

      if (result.ok) {
        toast.success(result.message);
        setConfirmAction(null);
        refreshNavigationSummary();
        router.refresh();
        return;
      }

      setConfirmAction(null);
      toast.error(result.message);
    });
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 font-bold text-primary-dark">
            {offer.provider.name.slice(0, 1)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold text-slate-950">{offer.provider.name}</h2>
              {offer.provider.isTrusted ? <ShieldCheck className="size-4 text-primary" /> : null}
              <OfferStatusBadge status={offer.status} />
            </div>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {offer.provider.avgRating.toFixed(1)} من {offer.provider.totalReviews} تقييم
              {offer.provider.region ? ` · ${regionLabels[offer.provider.region]}` : ""}
            </p>
          </div>
        </div>
        <p className="flex items-center gap-1 text-sm text-slate-500">
          <Clock className="size-4" />
          {formatDistanceToNow(offer.createdAt, { addSuffix: true, locale: ar })}
        </p>
      </div>

      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">{offer.message}</p>

      <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
        <span>السعر: {offer.price}</span>
        <span>المدة: {offer.duration}</span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild variant="secondary" size="sm">
          <Link href={`/providers/${offer.provider.id}`}>ملف مقدم الخدمة</Link>
        </Button>

        {offer.provider.whatsapp ? (
          <WhatsAppButton phone={offer.provider.whatsapp} label="واتساب" />
        ) : null}

        {offer.status === "PENDING" ? (
          <>
            <Button
              type="button"
              size="sm"
              disabled={isPending}
              onClick={() => setConfirmAction("accept")}
            >
              <Check className="size-4" />
              قبول العرض
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={() => setConfirmAction("reject")}
            >
              <X className="size-4" />
              رفض العرض
            </Button>
          </>
        ) : null}
      </div>
      <span className="sr-only">طلب مرتبط: {jobId}</span>
      {offer.status === "ACCEPTED" && !offer.reviewedByCurrentUser ? (
        <ReviewForm receiverId={offer.provider.id} jobPostId={jobId} receiverName={offer.provider.name} />
      ) : null}

      {offer.status === "ACCEPTED" && offer.reviewedByCurrentUser ? (
        <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-600">
          تم تقييم مقدم الخدمة.
        </p>
      ) : null}

      <OfferActionConfirmDialog
        action={confirmAction}
        isPending={isPending}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction) {
            runAction(confirmAction);
          }
        }}
      />
    </article>
  );
}

function OfferActionConfirmDialog({
  action,
  isPending,
  onCancel,
  onConfirm,
}: {
  action: "accept" | "reject" | null;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!action || typeof document === "undefined") {
    return null;
  }

  const isAccept = action === "accept";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] grid min-h-[100svh] place-items-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="offer-action-confirm-title"
    >
      <div className="w-[calc(100%-32px)] max-w-sm rounded-2xl bg-white p-6 text-right shadow-2xl sm:w-full">
        <h3 id="offer-action-confirm-title" className="text-lg font-bold text-slate-950">
          {isAccept ? "قبول العرض" : "رفض العرض"}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {isAccept
            ? "هل أنت متأكد من قبول هذا العرض؟ سيتم رفض باقي العروض المعلقة تلقائياً."
            : "هل أنت متأكد من رفض هذا العرض؟"}
        </p>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:grid sm:grid-cols-2 sm:gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
            إلغاء
          </Button>
          <Button
            type="button"
            variant={isAccept ? "default" : "destructive"}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "جاري التنفيذ..." : isAccept ? "تأكيد القبول" : "تأكيد الرفض"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
