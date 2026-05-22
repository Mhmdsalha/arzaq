export type RegionKey = "NORTH_GAZA" | "GAZA_CITY" | "CENTRAL" | "KHAN_YOUNIS" | "RAFAH" | "ONLINE";

export type WorkMode = "ONLINE" | "FIELD" | "BOTH";
export type JobStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  color: string;
};

export type JobPost = {
  id: string;
  title: string;
  description: string;
  categorySlug: string;
  categoryName: string;
  region: RegionKey;
  workMode: WorkMode;
  budget: string;
  isUrgent: boolean;
  status: JobStatus;
  postedAt: string;
  expiresAt?: string;
  authorName: string;
  authorType: string;
  whatsapp: string;
  skills: string[];
};

export type Review = {
  id: string;
  giverName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type PortfolioItem = {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
};

export type ProviderProfile = {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl: string;
  region: RegionKey;
  categorySlugs: string[];
  skills: string[];
  rating: number;
  reviewsCount: number;
  completedJobs: number;
  isTrusted: boolean;
  whatsapp: string;
  portfolio: PortfolioItem[];
  reviews: Review[];
};
