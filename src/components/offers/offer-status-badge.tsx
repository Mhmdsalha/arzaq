import type { OfferStatus } from "@prisma/client";

import { offerStatusLabels } from "@/constants/offers";

const statusClasses: Record<OfferStatus, string> = {
  PENDING: "border-slate-200 bg-slate-100 text-slate-700",
  ACCEPTED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
  WITHDRAWN: "border-amber-200 bg-amber-50 text-amber-700",
};

export function OfferStatusBadge({ status }: { status: OfferStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[status]}`}
    >
      {offerStatusLabels[status]}
    </span>
  );
}
