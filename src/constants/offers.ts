import type { OfferStatus } from "@prisma/client";

export const offerStatusLabels: Record<OfferStatus, string> = {
  PENDING: "بانتظار الرد",
  ACCEPTED: "مقبول",
  REJECTED: "مرفوض",
  WITHDRAWN: "مسحوب",
};
