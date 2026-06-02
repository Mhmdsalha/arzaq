"use client";

import { Loader2, Star } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { createListingReviewAction } from "@/actions/listing-review.actions";
import { StarRating } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";

export function ListingReviewButton({ orderId }: { orderId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitReview() {
    startTransition(async () => {
      const result = await createListingReviewAction({
        orderId,
        rating,
        comment,
      });

      if (result.ok) {
        toast.success(result.message);
        setIsOpen(false);
        setComment("");
        return;
      }

      toast.error(result.message);
    });
  }

  return (
    <>
      <Button type="button" className="h-10" onClick={() => setIsOpen(true)}>
        <Star className="size-4" />
        قيّم الطلب
      </Button>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] grid min-h-[100svh] place-items-center bg-slate-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl bg-white p-6 text-right shadow-2xl"
          >
            <h2 className="text-lg font-bold text-slate-950">تقييم المنتج أو الخدمة</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              تقييمك يساعد الآخرين على اختيار الخدمات والمنتجات بثقة.
            </p>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="mb-2 text-sm font-bold text-slate-700">اختر التقييم</p>
              <StarRating value={rating} onChange={setRating} size="md" />
            </div>

            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="mt-4 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-right text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="اكتب تعليقاً اختيارياً..."
              maxLength={500}
            />

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={isPending}>
                إلغاء
              </Button>
              <Button type="button" onClick={submitReview} disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {isPending ? "جاري الإرسال..." : "إرسال التقييم"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
