import type { DeliveryMethod, ListingStatus, ListingType } from "@prisma/client";

export const listingTypeLabels: Record<ListingType, string> = {
  SERVICE: "خدمة جاهزة",
  PHYSICAL: "منتج",
};

export const listingStatusLabels: Record<ListingStatus, string> = {
  PENDING_REVIEW: "قيد المراجعة",
  NEEDS_EDIT: "يحتاج تعديلات",
  REJECTED: "مرفوض",
  ACTIVE: "متاح",
  PAUSED: "متوقف مؤقتاً",
  SOLD_OUT: "نفد المخزون",
  DELETED: "محذوف",
};

export const deliveryMethodLabels: Record<DeliveryMethod, string> = {
  IN_PERSON: "استلام شخصي",
  DELIVERY: "توصيل",
  ONLINE: "عبر الإنترنت",
  WHATSAPP: "واتساب",
};

export const listingPriceLabelOptions = [
  "سعر ثابت",
  "يبدأ من",
  "حسب الاتفاق",
  "شامل التوصيل",
  "غير شامل التوصيل",
  "قابل للتفاوض",
] as const;

export const listingDeliveryTimeOptions = [
  "فوري",
  "خلال 24 ساعة",
  "خلال يومين",
  "3 أيام",
  "أسبوع",
  "حسب الاتفاق",
] as const;

export const storeSortLabels = {
  newest: "الأحدث",
  price_asc: "الأقل سعراً",
  price_desc: "الأعلى سعراً",
  popular: "الأكثر مشاهدة",
} as const;

export type StoreSort = keyof typeof storeSortLabels;

export const storeSortValues = Object.keys(storeSortLabels) as StoreSort[];
