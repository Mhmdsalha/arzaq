import { StarRating } from "@/components/shared/star-rating";
import type { Review } from "@/types/marketplace";

export function ProviderReviews({ reviews }: { reviews: Review[] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-950">تقييمات العملاء</h2>
      <div className="grid gap-3">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-950">{review.giverName}</h3>
                <p className="text-xs text-slate-500">{review.createdAt}</p>
              </div>
              <StarRating value={review.rating} />
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">{review.comment}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
