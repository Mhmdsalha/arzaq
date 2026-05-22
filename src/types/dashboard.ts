import type { NotificationType, Region, UserRole } from "@prisma/client";

export type DashboardShellUser = {
  id: string;
  name: string;
  email: string | null;
  role: UserRole;
  isVerified: boolean;
  profile: {
    avatarUrl: string | null;
    whatsapp: string | null;
    isTrusted: boolean;
    region: Region | null;
  } | null;
};

export type DashboardStatsData = {
  postedJobs: number;
  sentOffers: number;
  acceptedOffers: number;
  savedJobs: number;
};

export type DashboardActivityItem = {
  id: string;
  type: "JOB_POSTED" | "OFFER_SENT" | "REVIEW_RECEIVED";
  title: string;
  description: string;
  href: string;
  createdAt: Date;
};

export type DashboardNotificationItem = {
  id: string;
  type: NotificationType;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
};

export type ProfileCompletionData = {
  percent: number;
  checks: Array<{
    key: "avatar" | "bio" | "skills" | "whatsapp" | "region";
    label: string;
    isComplete: boolean;
  }>;
};

export type DashboardOverviewData = {
  stats: DashboardStatsData;
  activities: DashboardActivityItem[];
  notifications: DashboardNotificationItem[];
  profileCompletion: ProfileCompletionData;
};
