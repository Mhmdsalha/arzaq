import type { Prisma, Region, WorkMode } from "@prisma/client";

import { prisma } from "@/lib/prisma";
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
};

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
        profile: {
          select: {
            title: true,
            bio: true,
            region: true,
            workMode: true,
            avatarUrl: true,
            whatsapp: true,
            portfolioUrls: true,
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
      title: profile.title ?? "",
      bio: profile.bio ?? "",
      region: profile.region,
      workMode: profile.workMode,
      avatarUrl: profile.avatarUrl ?? "",
      whatsapp: profile.whatsapp ?? "",
      portfolioUrls: profile.portfolioUrls,
      skillIds: profile.skills.map((skill) => skill.skillId),
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

  if (skillIds.length > 0) {
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

  const profileData: Prisma.ProfileUpdateInput = {
    title,
    bio,
    region: input.region,
    workMode: input.workMode,
    avatarUrl,
    whatsapp,
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
        workMode: input.workMode,
        avatarUrl,
        whatsapp,
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
      },
      update: profileData,
    }),
  ]);
}
