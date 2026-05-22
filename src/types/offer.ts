import type { JobStatus, OfferStatus, Region, WorkMode } from "@prisma/client";

export type OfferFormDefaults = {
  message: string;
  price: string;
  duration: string;
};

export type UserOfferItem = {
  id: string;
  message: string;
  price: string;
  duration: string;
  status: OfferStatus;
  createdAt: Date;
  job: {
    id: string;
    title: string;
    categoryName: string;
    region: Region;
    workMode: WorkMode;
    status: JobStatus;
    ownerWhatsapp: string | null;
  };
};

export type ReceivedOfferItem = {
  id: string;
  message: string;
  price: string;
  duration: string;
  status: OfferStatus;
  createdAt: Date;
  provider: {
    id: string;
    name: string;
    avatarUrl: string | null;
    region: Region | null;
    avgRating: number;
    totalReviews: number;
    isTrusted: boolean;
    whatsapp: string | null;
  };
};

export type JobOffersData = {
  job: {
    id: string;
    title: string;
    status: JobStatus;
    offersCount: number;
  };
  offers: ReceivedOfferItem[];
};

export type PaginatedOffers<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
