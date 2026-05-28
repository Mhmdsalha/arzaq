import type { AccountType, UserRole } from "@prisma/client";
import { cache } from "react";

import { prisma } from "@/lib/prisma";

export type NavigationSummary = {
  user: {
    id: string;
    name: string;
    email: string | null;
    role: UserRole;
    accountType: AccountType;
  };
  avatarUrl: string | null;
  profileCompletion: number;
  unreadCount: number;
  stats: {
    postedJobs: number;
    receivedOffers: number;
    sentOffers: number;
    acceptedOffers: number;
  };
};

export const getNavigationSummary = cache(async (userId: string): Promise<NavigationSummary> => {
  return getNavigationSummaryFresh(userId);
});

export async function getNavigationSummaryFresh(userId: string): Promise<NavigationSummary> {
  const [user, profile, unreadCount, postedJobs, receivedOffers, sentOffers, acceptedOffers] =
    await prisma.$transaction([
      prisma.user.findFirst({
        where: {
          id: userId,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          accountType: true,
        },
      }),
      prisma.profile.findUnique({
        where: {
          userId,
        },
        select: {
          avatarUrl: true,
          bio: true,
          whatsapp: true,
          region: true,
          skills: {
            select: {
              skillId: true,
            },
          },
        },
      }),
      prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),
      prisma.jobPost.count({
        where: {
          authorId: userId,
          deletedAt: null,
        },
      }),
      prisma.offer.count({
        where: {
          jobPost: {
            authorId: userId,
            deletedAt: null,
          },
        },
      }),
      prisma.offer.count({
        where: {
          providerId: userId,
        },
      }),
      prisma.offer.count({
        where: {
          providerId: userId,
          status: "ACCEPTED",
        },
      }),
    ]);

  if (!user) {
    throw new Error("الحساب غير موجود");
  }

  const checks = [
    Boolean(profile?.avatarUrl),
    Boolean(profile?.bio?.trim()),
    Boolean(profile?.skills.length),
    Boolean(profile?.whatsapp),
    Boolean(profile?.region),
  ];

  return {
    user,
    avatarUrl: profile?.avatarUrl ?? null,
    profileCompletion: checks.filter(Boolean).length * 20,
    unreadCount,
    stats: {
      postedJobs,
      receivedOffers,
      sentOffers,
      acceptedOffers,
    },
  };
}

export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 30,
    select: {
      id: true,
      message: true,
      link: true,
      isRead: true,
      createdAt: true,
    },
  });
}

export async function markUserNotificationsAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}
