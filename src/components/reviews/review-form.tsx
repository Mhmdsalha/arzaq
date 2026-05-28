"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { createReviewAction } from "@/actions/review.actions";
import { StarRating } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";
import { refreshNavigationSummary } from "@/hooks/useUnreadCount";

export function ReviewForm({
  receiverId,
  jobPostId,
  receiverName,
  onDone,
}: {
  receiverId: string;
  jobPostId: string;
  receiverName: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitReview() {
    startTransition(async () => {
      const result = await createReviewAction({
        receiverId,
        jobPostId,
        rating,
        comment,
      });

      if (result.ok) {
        toast.success(result.message);
        refreshNavigationSummary();
        router.refresh();
        onDone?.();
        return;
      }

      toast.error(result.message);
    });
  }

  return (
    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-950">قيّم تجربتك مع {receiverName}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            تقييمك يساعد المجتمع على اختيار الأشخاص المناسبين بثقة.
          </p>
        </div>
        <StarRating value={rating} size="md" onChange={setRating} disabled={isPending} />
      </div>
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        maxLength={500}
        rows={3}
        className="mt-3 min-h-24 w-full resize-y rounded-xl border border-amber-100 bg-white px-4 py-3 text-right text-base leading-7 text-slate-800 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-200"
        placeholder="اكتب تعليقاً مختصراً عن التجربة، أو اتركه فارغاً..."
        disabled={isPending}
      />
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-slate-500">{comment.length}/500</span>
        <Button type="button" size="sm" onClick={submitReview} disabled={isPending || rating === 0}>
          {isPending ? "جاري إرسال التقييم..." : "إرسال التقييم"}
        </Button>
      </div>
    </div>
  );
}
