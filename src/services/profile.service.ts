import type { Prisma, Region, WorkMode } from "@prisma/client";
import { cache } from "react";

import { isDatabaseConnectionError, isDatabaseTemporarilyUnavailable, prisma } from "@/lib/prisma";
import type { ProviderProfile } from "@/types/marketplace";
import type { ProfileEditorData } from "@/types/profile";

type UpdateProfileInput = {
  name: string;
  title?: string;
  bio?: string;
  region: Region;
  workMode: WorkMode;
  skills: string[];
  whatsapp?: string;
  avatarUrl?: string;
  portfolioUrls: string[];
  isAvailable: boolean;
};

const fallbackAvatar =
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80";

export async function getProfileByUserId(userId: string): Promise<ProfileEditorData | null> {
  const [user, skills] = await prisma.$transaction([
    prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        accountType: true,
        profile: {
          select: {
            title: true,
            bio: true,
            region: true,
            workMode: true,
            avatarUrl: true,
            whatsapp: true,
            portfolioUrls: true,
            isAvailable: true,
            skills: {
              select: {
                skillId: true,
              },
            },
          },
        },
      },
    }),
    prisma.skill.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  ]);

  if (!user) {
    return null;
  }

  const profile =
    user.profile ??
    (await prisma.profile.create({
      data: {
        userId,
        region: "ONLINE",
      },
      select: {
        title: true,
        bio: true,
        region: true,
        workMode: true,
        avatarUrl: true,
        whatsapp: true,
        portfolioUrls: true,
        isAvailable: true,
        skills: {
          select: {
            skillId: true,
          },
        },
      },
    }));

  return {
    profile: {
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      accountType: user.accountType,
      title: profile.title ?? "",
      bio: profile.bio ?? "",
      region: profile.region,
      workMode: profile.workMode,
      avatarUrl: profile.avatarUrl ?? "",
      whatsapp: profile.whatsapp ?? "",
      portfolioUrls: profile.portfolioUrls,
      skillIds: profile.skills.map((skill) => skill.skillId),
      isAvailable: profile.isAvailable,
    },
    skills,
  };
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const skillIds = [...new Set(input.skills)];
  const title = input.title?.trim() || null;
  const bio = input.bio?.trim() || null;
  const avatarUrl = input.avatarUrl?.trim() || null;
  const whatsapp = input.whatsapp?.trim() || null;
  const portfolioUrls = input.portfolioUrls
    .map((url) => url.trim())
    .filter((url) => url.length > 0);

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
    select: {
      accountType: true,
    },
  });

  if (!user) {
    throw new Error("الحساب غير موجود");
  }

  if (user.accountType === "PROVIDER" && skillIds.length > 0) {
    const existingSkills = await prisma.skill.count({
      where: {
        id: {
          in: skillIds,
        },
      },
    });

    if (existingSkills !== skillIds.length) {
      throw new Error("بعض المهارات المختارة غير صحيحة");
    }
  }

  const providerProfileData: Prisma.ProfileUpdateInput =
    user.accountType === "PROVIDER"
      ? {
          title,
          bio,
          workMode: input.workMode,
          isAvailable: input.isAvailable,
          portfolioUrls,
          skills: {
            deleteMany: {},
            create: skillIds.map((skillId) => ({
              skill: {
                connect: {
                  id: skillId,
                },
              },
            })),
          },
        }
      : {};

  const profileData: Prisma.ProfileUpdateInput = {
    region: input.region,
    avatarUrl,
    whatsapp,
    ...providerProfileData,
  };

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: input.name,
      },
    }),
    prisma.profile.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        title,
        bio,
        region: input.region,
        workMode: user.accountType === "PROVIDER" ? input.workMode : "BOTH",
        avatarUrl,
        whatsapp,
        ...(user.accountType === "PROVIDER"
          ? {
              title,
              bio,
              isAvailable: input.isAvailable,
              portfolioUrls,
              skills: {
                create: skillIds.map((skillId) => ({
                  skill: {
                    connect: {
                      id: skillId,
                    },
                  },
                })),
              },
            }
          : {}),
      },
      update: profileData,
    }),
  ]);
}

export const getPublicProviders = cache(async (): Promise<ProviderProfile[]> => {
  if (isDatabaseTemporarilyUnavailable()) {
    return [];
  }

  try {
    const providers = await prisma.user.findMany({
      where: {
        accountType: "PROVIDER",
        deletedAt: null,
        isBanned: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: publicProviderSelect(),
    });

    return providers.map(mapPublicProvider);
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return [];
    }

    throw error;
  }
});

export const getPublicProviderById = cache(
  async (providerId: string): Promise<ProviderProfile | null> => {
    if (isDatabaseTemporarilyUnavailable()) {
      return null;
    }

    try {
      const provider = await prisma.user.findFirst({
        where: {
          id: providerId,
          accountType: "PROVIDER",
          deletedAt: null,
          isBanned: false,
        },
        select: publicProviderSelect(),
      });

      return provider ? mapPublicProvider(provider) : null;
    } catch (error) {
      if (isDatabaseConnectionError(error)) {
        return null;
      }

      throw error;
    }
  },
);

function publicProviderSelect() {
  return {
    id: true,
    name: true,
    createdAt: true,
    profile: {
      select: {
        title: true,
        bio: true,
        avatarUrl: true,
        region: true,
        whatsapp: true,
        avgRating: true,
        totalReviews: true,
        isTrusted: true,
        portfolioItems: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            title: true,
            imageUrl: true,
            description: true,
          },
        },
        skills: {
          select: {
            skill: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    },
    offers: {
      where: {
        status: "ACCEPTED",
      },
      select: {
        id: true,
      },
    },
    reviewsReceived: {
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        giver: {
          select: {
            name: true,
          },
        },
      },
    },
  } satisfies Prisma.UserSelect;
}

type PublicProviderPayload = Prisma.UserGetPayload<{
  select: ReturnType<typeof publicProviderSelect>;
}>;

function mapPublicProvider(provider: PublicProviderPayload): ProviderProfile {
  const profile = provider.profile;

  return {
    id: provider.id,
    name: provider.name,
    title: profile?.title || "مقدم خدمة",
    bio: profile?.bio || "مقدم خدمة ضمن منصة أرزاق.",
    avatarUrl: profile?.avatarUrl || fallbackAvatar,
    region: profile?.region ?? "ONLINE",
    categorySlugs: profile?.skills.map((item) => item.skill.slug) ?? [],
    skills: profile?.skills.map((item) => item.skill.name) ?? [],
    rating: profile?.avgRating ?? 0,
    reviewsCount: profile?.totalReviews ?? 0,
    completedJobs: provider.offers.length,
    isTrusted: profile?.isTrusted ?? false,
    whatsapp: profile?.whatsapp ?? "",
    portfolio:
      profile?.portfolioItems.map((item) => ({
        id: item.id,
        title: item.title ?? "عمل سابق",
        imageUrl: item.imageUrl,
        description: item.description ?? "",
      })) ?? [],
    reviews: provider.reviewsReceived.map((review) => ({
      id: review.id,
      giverName: review.giver.name,
      rating: review.rating,
      comment: review.comment ?? "",
      createdAt: review.createdAt.toISOString().slice(0, 10),
    })),
  };
}
