import type { DeliveryMethod, ListingStatus, ListingType, Region } from "@prisma/client";

import type { JobCategoryOption } from "@/types/job";

export type ListingCategoryOption = JobCategoryOption;

export type ListingListItem = {
  id: string;
  title: string;
  description: string;
  type: ListingType;
  price: number;
  priceLabel: string | null;
  deliveryMethod: DeliveryMethod;
  deliveryTime: string | null;
  region: Region;
  quantity: number | null;
  images: string[];
  tags: string[];
  status: ListingStatus;
  viewCount: number;
  avgRating: number;
  totalReviews: number;
  isFeatured: boolean;
  createdAt: Date;
  category: ListingCategoryOption;
  seller: {
    id: string;
    name: string;
    avatarUrl: string | null;
    isTrusted: boolean;
    whatsapp: string | null;
    showWhatsapp: boolean;
  };
  ordersCount: number;
  isSaved: boolean;
};

export type ListingDetailsData = ListingListItem & {
  seller: ListingListItem["seller"] & {
    avgRating: number;
    totalReviews: number;
    region: Region | null;
    createdAt: Date;
    isVerified: boolean;
  };
  isOwner: boolean;
};

export type PaginatedListings<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
