import { prisma } from "@/lib/prisma";
import type {
  DashboardActivityItem,
  DashboardOverviewData,
  DashboardShellUser,
  ProfileCompletionData,
} from "@/types/dashboard";

export async function getDashboardShellUser(userId: string): Promise<DashboardShellUser | null> {
  return prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      profile: {
        select: {
          avatarUrl: true,
          whatsapp: true,
          isTrusted: true,
          region: true,
        },
      },
    },
  });
}

export async function getDashboardOverviewData(userId: string): Promise<DashboardOverviewData> {
  const [postedJobs, sentOffers, acceptedOffers, savedJobs] = await prisma.$transaction([
    prisma.jobPost.count({
      where: {
        authorId: userId,
        deletedAt: null,
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
    prisma.savedJob.count({
      where: {
        userId,
      },
    }),
  ]);

  const [notifications, profile, recentJobs, recentOffers, recentReviews] =
    await prisma.$transaction([
      prisma.notification.findMany({
        where: {
          userId,
        },
        orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
        take: 5,
        select: {
          id: true,
          type: true,
          message: true,
          link: true,
          isRead: true,
          createdAt: true,
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
      prisma.jobPost.findMany({
        where: {
          authorId: userId,
          deletedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
      }),
      prisma.offer.findMany({
        where: {
          providerId: userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          createdAt: true,
          jobPost: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.review.findMany({
        where: {
          receiverId: userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          rating: true,
          createdAt: true,
          giver: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

  return {
    stats: {
      postedJobs,
      sentOffers,
      acceptedOffers,
      savedJobs,
    },
    notifications,
    activities: buildRecentActivities({ recentJobs, recentOffers, recentReviews }),
    profileCompletion: calculateProfileCompletion(profile),
  };
}

function calculateProfileCompletion(
  profile: {
    avatarUrl: string | null;
    bio: string | null;
    whatsapp: string | null;
    region: string | null;
    skills: Array<{ skillId: string }>;
  } | null,
): ProfileCompletionData {
  const checks: ProfileCompletionData["checks"] = [
    {
      key: "avatar",
      label: "صورة البروفايل",
      isComplete: Boolean(profile?.avatarUrl),
    },
    {
      key: "bio",
      label: "نبذة تعريفية",
      isComplete: Boolean(profile?.bio?.trim()),
    },
    {
      key: "skills",
      label: "المهارات",
      isComplete: Boolean(profile?.skills.length),
    },
    {
      key: "whatsapp",
      label: "رقم واتساب",
      isComplete: Boolean(profile?.whatsapp),
    },
    {
      key: "region",
      label: "المنطقة",
      isComplete: Boolean(profile?.region),
    },
  ];

  const completedCount = checks.filter((check) => check.isComplete).length;

  return {
    checks,
    percent: completedCount * 20,
  };
}

function buildRecentActivities(input: {
  recentJobs: Array<{ id: string; title: string; createdAt: Date }>;
  recentOffers: Array<{ id: string; createdAt: Date; jobPost: { id: string; title: string } }>;
  recentReviews: Array<{ id: string; rating: number; createdAt: Date; giver: { name: string } }>;
}): DashboardActivityItem[] {
  const activities: DashboardActivityItem[] = [
    ...input.recentJobs.map((job) => ({
      id: `job-${job.id}`,
      type: "JOB_POSTED" as const,
      title: "نشرت طلبًا جديدًا",
      description: job.title,
      href: `/jobs/${job.id}`,
      createdAt: job.createdAt,
    })),
    ...input.recentOffers.map((offer) => ({
      id: `offer-${offer.id}`,
      type: "OFFER_SENT" as const,
      title: "أرسلت عرضًا",
      description: offer.jobPost.title,
      href: `/jobs/${offer.jobPost.id}`,
      createdAt: offer.createdAt,
    })),
    ...input.recentReviews.map((review) => ({
      id: `review-${review.id}`,
      type: "REVIEW_RECEIVED" as const,
      title: "وصل تقييم جديد",
      description: `${review.giver.name} قيّمك ${review.rating} من 5`,
      href: "/dashboard/profile",
      createdAt: review.createdAt,
    })),
  ];

  return activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);
}
