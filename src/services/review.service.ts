import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { CreateReviewInput } from "@/schemas/review.schema";

export async function createReview(data: CreateReviewInput, giverId: string) {
  if (giverId === data.receiverId) {
    throw new Error("لا يمكنك تقييم نفسك");
  }

  const job = await prisma.jobPost.findFirst({
    where: {
      id: data.jobPostId,
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      authorId: true,
      offers: {
        where: {
          status: "ACCEPTED",
        },
        select: {
          providerId: true,
        },
        take: 1,
      },
    },
  });

  if (!job || job.offers.length === 0) {
    throw new Error("لا يمكن تقييم هذا الطلب حالياً");
  }

  const acceptedProviderId = job.offers[0]?.providerId;
  const ownerRatesProvider = job.authorId === giverId && acceptedProviderId === data.receiverId;
  const providerRatesOwner = acceptedProviderId === giverId && job.authorId === data.receiverId;

  if (!ownerRatesProvider && !providerRatesOwner) {
    throw new Error("ليس لديك صلاحية تقييم هذا المستخدم");
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      giverId,
      jobPostId: job.id,
    },
    select: {
      id: true,
    },
  });

  if (existingReview) {
    throw new Error("قيّمت هذا الطلب مسبقاً");
  }

  const review = await prisma
    .$transaction(async (tx) => {
      const createdReview = await tx.review.create({
        data: {
          rating: data.rating,
          comment: data.comment?.trim() || null,
          giverId,
          receiverId: data.receiverId,
          jobPostId: job.id,
        },
        select: {
          id: true,
        },
      });

      const ratingStats = await tx.review.aggregate({
        where: {
          receiverId: data.receiverId,
        },
        _avg: {
          rating: true,
        },
        _count: {
          rating: true,
        },
      });

      await tx.profile.update({
        where: {
          userId: data.receiverId,
        },
        data: {
          avgRating: ratingStats._avg.rating ?? data.rating,
          totalReviews: ratingStats._count.rating,
        },
      });

      await tx.notification.create({
        data: {
          userId: data.receiverId,
          type: "NEW_REVIEW",
          message: `وصلك تقييم جديد على: ${job.title}`,
          link: "/dashboard",
        },
      });

      return createdReview;
    })
    .catch((error: unknown) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("قيّمت هذا الطلب مسبقاً");
      }

      throw error;
    });

  return review;
}
