import { OfferCard } from "@/components/offers/offer-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { ReceivedOfferItem, UserOfferItem } from "@/types/offer";

export function OffersList(
  props:
    | {
        variant: "submitted";
        offers: UserOfferItem[];
      }
    | {
        variant: "received";
        offers: ReceivedOfferItem[];
        jobId: string;
      },
) {
  if (props.offers.length === 0) {
    return (
      <EmptyState
        title={props.variant === "submitted" ? "لا توجد عروض مرسلة" : "لا توجد عروض بعد"}
        description={
          props.variant === "submitted"
            ? "عندما تقدم على طلبات العمل ستظهر عروضك هنا."
            : "ستظهر عروض المتقدمين هنا بمجرد وصول أول عرض."
        }
      />
    );
  }

  if (props.variant === "submitted") {
    return (
      <div className="grid gap-4">
        {props.offers.map((offer) => (
          <OfferCard key={offer.id} variant="submitted" offer={offer} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {props.offers.map((offer) => (
        <OfferCard key={offer.id} variant="received" offer={offer} jobId={props.jobId} />
      ))}
    </div>
  );
}
