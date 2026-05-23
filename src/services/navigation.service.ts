import { prisma } from "@/lib/prisma";

export type NavigationSummary = {
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

export async function getNavigationSummary(userId: string): Promise<NavigationSummary> {
  const [profile, unreadCount, postedJobs, receivedOffers, sentOffers, acceptedOffers] =
    await prisma.$transaction([
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

  const checks = [
    Boolean(profile?.avatarUrl),
    Boolean(profile?.bio?.trim()),
    Boolean(profile?.skills.length),
    Boolean(profile?.whatsapp),
    Boolean(profile?.region),
  ];

  return {
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
