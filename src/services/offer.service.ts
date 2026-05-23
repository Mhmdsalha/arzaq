import type { Prisma } from "@prisma/client";

import { assertProvider } from "@/lib/authGuards";
import { prisma } from "@/lib/prisma";
import type {
  JobOffersData,
  PaginatedOffers,
  ReceivedOfferItem,
  UserOfferItem,
} from "@/types/offer";

const DEFAULT_PAGE_SIZE = 12;

export type OfferInput = {
  message: string;
  price?: string;
  duration?: string;
};

export async function createOffer(data: OfferInput & { jobPostId: string }, userId: string) {
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
    throw new Error("غير مصرح لك بهذا الإجراء");
  }

  assertProvider(user.accountType);

  const job = await prisma.jobPost.findFirst({
    where: {
      id: data.jobPostId,
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      status: true,
      authorId: true,
    },
  });

  if (!job) {
    throw new Error("الطلب غير موجود");
  }

  if (job.status !== "OPEN") {
    throw new Error("هذا الطلب مغلق");
  }

  if (job.authorId === userId) {
    throw new Error("لا يمكنك التقديم على طلبك");
  }

  const existingOffer = await prisma.offer.findUnique({
    where: {
      jobPostId_providerId: {
        jobPostId: data.jobPostId,
        providerId: userId,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingOffer) {
    throw new Error("قدمت عرضاً على هذا الطلب مسبقاً");
  }

  const offer = await prisma.offer.create({
    data: {
      jobPostId: data.jobPostId,
      providerId: userId,
      message: data.message,
      price: normalizeOptionalText(data.price),
      duration: normalizeOptionalText(data.duration),
    },
    select: {
      id: true,
    },
  });

  await prisma.notification.create({
    data: {
      userId: job.authorId,
      type: "NEW_OFFER",
      message: `لديك عرض جديد على طلبك: ${job.title}`,
      link: `/dashboard/jobs/${job.id}/offers`,
    },
  });

  return offer;
}

export async function updateOffer(id: string, data: OfferInput, userId: string) {
  const result = await prisma.offer.updateMany({
    where: {
      id,
      providerId: userId,
      status: "PENDING",
    },
    data: {
      message: data.message,
      price: normalizeOptionalText(data.price),
      duration: normalizeOptionalText(data.duration),
    },
  });

  if (result.count === 0) {
    throw new Error("لا يمكن تعديل هذا العرض");
  }
}

export async function withdrawOffer(id: string, userId: string) {
  const result = await prisma.offer.updateMany({
    where: {
      id,
      providerId: userId,
      status: "PENDING",
    },
    data: {
      status: "WITHDRAWN",
    },
  });

  if (result.count === 0) {
    throw new Error("لا يمكن سحب هذا العرض");
  }
}

export async function acceptOffer(offerId: string, userId: string) {
  await prisma.$transaction(async (tx) => {
    const offer = await tx.offer.findUnique({
      where: {
        id: offerId,
      },
      select: {
        id: true,
        status: true,
        providerId: true,
        jobPost: {
          select: {
            id: true,
            title: true,
            status: true,
            authorId: true,
          },
        },
      },
    });

    if (!offer || offer.jobPost.authorId !== userId) {
      throw new Error("لا تملك صلاحية قبول هذا العرض");
    }

    if (!["OPEN", "IN_PROGRESS"].includes(offer.jobPost.status)) {
      throw new Error("لا يمكن قبول عرض على طلب مغلق");
    }

    if (offer.status !== "PENDING") {
      throw new Error("هذا العرض لم يعد بانتظار الرد");
    }

    const rejectedOffers = await tx.offer.findMany({
      where: {
        jobPostId: offer.jobPost.id,
        id: {
          not: offer.id,
        },
        status: "PENDING",
      },
      select: {
        providerId: true,
      },
    });

    await tx.offer.update({
      where: {
        id: offer.id,
      },
      data: {
        status: "ACCEPTED",
      },
    });

    await tx.offer.updateMany({
      where: {
        jobPostId: offer.jobPost.id,
        id: {
          not: offer.id,
        },
        status: "PENDING",
      },
      data: {
        status: "REJECTED",
      },
    });

    await tx.jobPost.update({
      where: {
        id: offer.jobPost.id,
      },
      data: {
        status: "IN_PROGRESS",
      },
    });

    await tx.notification.create({
      data: {
        userId: offer.providerId,
        type: "OFFER_ACCEPTED",
        message: `تم قبول عرضك على: ${offer.jobPost.title}`,
        link: "/dashboard/offers",
      },
    });

    if (rejectedOffers.length > 0) {
      await tx.notification.createMany({
        data: rejectedOffers.map((rejectedOffer) => ({
          userId: rejectedOffer.providerId,
          type: "OFFER_REJECTED",
          message: `عذراً، تم قبول عرض آخر على: ${offer.jobPost.title}`,
          link: "/dashboard/offers",
        })),
      });
    }
  });
}

export async function rejectOffer(offerId: string, userId: string) {
  const offer = await prisma.offer.findUnique({
    where: {
      id: offerId,
    },
    select: {
      providerId: true,
      status: true,
      jobPost: {
        select: {
          id: true,
          title: true,
          authorId: true,
        },
      },
    },
  });

  if (!offer || offer.jobPost.authorId !== userId) {
    throw new Error("لا تملك صلاحية رفض هذا العرض");
  }

  if (offer.status !== "PENDING") {
    throw new Error("هذا العرض لم يعد بانتظار الرد");
  }

  await prisma.$transaction([
    prisma.offer.update({
      where: {
        id: offerId,
      },
      data: {
        status: "REJECTED",
      },
    }),
    prisma.notification.create({
      data: {
        userId: offer.providerId,
        type: "OFFER_REJECTED",
        message: `تم رفض عرضك على: ${offer.jobPost.title}`,
        link: "/dashboard/offers",
      },
    }),
  ]);
}

export async function getUserOffers(
  userId: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedOffers<UserOfferItem>> {
  const currentPage = Math.max(page, 1);
  const where: Prisma.OfferWhereInput = {
    providerId: userId,
  };

  const [offers, total] = await prisma.$transaction([
    prisma.offer.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        message: true,
        price: true,
        duration: true,
        status: true,
        createdAt: true,
        jobPost: {
          select: {
            id: true,
            title: true,
            region: true,
            workMode: true,
            status: true,
            category: {
              select: {
                name: true,
              },
            },
            author: {
              select: {
                profile: {
                  select: {
                    whatsapp: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.offer.count({ where }),
  ]);

  return {
    items: offers.map(mapUserOffer),
    total,
    page: currentPage,
    pageSize,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export async function getJobOffers(jobId: string, userId: string): Promise<JobOffersData | null> {
  const job = await prisma.jobPost.findFirst({
    where: {
      id: jobId,
      authorId: userId,
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      status: true,
      _count: {
        select: {
          offers: true,
        },
      },
      offers: {
        orderBy: [{ status: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          message: true,
          price: true,
          duration: true,
          status: true,
          createdAt: true,
          provider: {
            select: {
              id: true,
              name: true,
              profile: {
                select: {
                  avatarUrl: true,
                  region: true,
                  avgRating: true,
                  totalReviews: true,
                  isTrusted: true,
                  whatsapp: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!job) {
    return null;
  }

  return {
    job: {
      id: job.id,
      title: job.title,
      status: job.status,
      offersCount: job._count.offers,
    },
    offers: job.offers.map(mapReceivedOffer).sort(sortReceivedOffers),
  };
}

function mapUserOffer(
  offer: Prisma.OfferGetPayload<{
    select: {
      id: true;
      message: true;
      price: true;
      duration: true;
      status: true;
      createdAt: true;
      jobPost: {
        select: {
          id: true;
          title: true;
          region: true;
          workMode: true;
          status: true;
          category: { select: { name: true } };
          author: { select: { profile: { select: { whatsapp: true } } } };
        };
      };
    };
  }>,
): UserOfferItem {
  return {
    id: offer.id,
    message: offer.message,
    price: offer.price ?? "حسب الاتفاق",
    duration: offer.duration ?? "حسب الاتفاق",
    status: offer.status,
    createdAt: offer.createdAt,
    job: {
      id: offer.jobPost.id,
      title: offer.jobPost.title,
      categoryName: offer.jobPost.category.name,
      region: offer.jobPost.region,
      workMode: offer.jobPost.workMode,
      status: offer.jobPost.status,
      ownerWhatsapp: offer.jobPost.author.profile?.whatsapp ?? null,
    },
  };
}

function mapReceivedOffer(
  offer: Prisma.OfferGetPayload<{
    select: {
      id: true;
      message: true;
      price: true;
      duration: true;
      status: true;
      createdAt: true;
      provider: {
        select: {
          id: true;
          name: true;
          profile: {
            select: {
              avatarUrl: true;
              region: true;
              avgRating: true;
              totalReviews: true;
              isTrusted: true;
              whatsapp: true;
            };
          };
        };
      };
    };
  }>,
): ReceivedOfferItem {
  return {
    id: offer.id,
    message: offer.message,
    price: offer.price ?? "حسب الاتفاق",
    duration: offer.duration ?? "حسب الاتفاق",
    status: offer.status,
    createdAt: offer.createdAt,
    provider: {
      id: offer.provider.id,
      name: offer.provider.name,
      avatarUrl: offer.provider.profile?.avatarUrl ?? null,
      region: offer.provider.profile?.region ?? null,
      avgRating: offer.provider.profile?.avgRating ?? 0,
      totalReviews: offer.provider.profile?.totalReviews ?? 0,
      isTrusted: offer.provider.profile?.isTrusted ?? false,
      whatsapp: offer.provider.profile?.whatsapp ?? null,
    },
  };
}

function sortReceivedOffers(a: ReceivedOfferItem, b: ReceivedOfferItem) {
  if (a.status === "PENDING" && b.status !== "PENDING") {
    return -1;
  }

  if (a.status !== "PENDING" && b.status === "PENDING") {
    return 1;
  }

  return a.createdAt.getTime() - b.createdAt.getTime();
}

function normalizeOptionalText(value?: string) {
  return value?.trim() || null;
}
