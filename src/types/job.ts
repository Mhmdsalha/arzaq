import type { JobStatus, Region, WorkMode } from "@prisma/client";

export type JobCategoryOption = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
};

export type JobListItem = {
  id: string;
  title: string;
  description: string;
  budget: string;
  duration: string;
  isUrgent: boolean;
  views: number;
  region: Region;
  workMode: WorkMode;
  status: JobStatus;
  createdAt: Date;
  expiresAt: Date | null;
  category: JobCategoryOption;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
    isTrusted: boolean;
  };
  offersCount: number;
  isSaved: boolean;
};

export type JobDetailsData = JobListItem & {
  author: JobListItem["author"] & {
    whatsapp: string | null;
    avgRating: number;
    totalReviews: number;
    region: Region | null;
  };
  alreadyApplied: boolean;
  isOwner: boolean;
};

export type UserJobItem = {
  id: string;
  title: string;
  categoryName: string;
  region: Region;
  status: JobStatus;
  offersCount: number;
  views: number;
  createdAt: Date;
  isUrgent: boolean;
};

export type JobFormData = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  region: Region;
  workMode: WorkMode;
  budget: string;
  duration: string;
  isUrgent: boolean;
  expiresAt: string;
  offersCount: number;
};

export type PaginatedJobs<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
