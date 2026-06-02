import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { CreateListingReviewInput } from "@/schemas/listing-review.schema";

export async function createListingReview(
  input: CreateListingReviewInput,
  reviewerId: string,
) {
  const order = await prisma.order.findFirst({
    where: {
      id: input.orderId,
      buyerId: reviewerId,
      status: "COMPLETED",
    },
    select: {
      id: true,
      listingId: true,
      listing: {
        select: {
          id: true,
          title: true,
          sellerId: true,
        },
      },
      review: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("يمكن تقييم الطلبات المكتملة فقط");
  }

  if (order.review) {
    throw new Error("تم تقييم هذا الطلب مسبقاً");
  }

  if (order.listing.sellerId === reviewerId) {
    throw new Error("لا يمكنك تقييم عنصر من متجرك");
  }

  return prisma
    .$transaction(async (tx) => {
      const review = await tx.listingReview.create({
        data: {
          listingId: order.listingId,
          orderId: order.id,
          reviewerId,
          rating: input.rating,
          comment: input.comment?.trim() || null,
        },
        select: {
          id: true,
          listingId: true,
        },
      });

      const stats = await tx.listingReview.aggregate({
        where: {
          listingId: order.listingId,
        },
        _avg: {
          rating: true,
        },
        _count: {
          rating: true,
        },
      });

      await tx.listing.update({
        where: {
          id: order.listingId,
        },
        data: {
          avgRating: stats._avg.rating ?? input.rating,
          totalReviews: stats._count.rating,
        },
      });

      await tx.notification.create({
        data: {
          userId: order.listing.sellerId,
          type: "NEW_REVIEW",
          message: `وصل تقييم جديد على: ${order.listing.title}`,
          link: `/store/${order.listingId}`,
        },
      });

      return review;
    })
    .catch((error: unknown) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("تم تقييم هذا الطلب مسبقاً");
      }

      throw error;
    });
}
