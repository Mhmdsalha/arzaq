import type { ProviderVerificationStatus, Region } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const REQUIRED_ACCEPTED_OFFERS_FOR_VERIFICATION = 5;

export type ProviderVerificationSummary = {
  isProvider: boolean;
  isTrusted: boolean;
  acceptedOffers: number;
  requiredOffers: number;
  remainingOffers: number;
  canRequest: boolean;
  latestRequest: {
    id: string;
    status: ProviderVerificationStatus;
    note: string | null;
    reviewedNote: string | null;
    createdAt: Date;
    reviewedAt: Date | null;
  } | null;
};

export type AdminProviderVerificationRequest = {
  id: string;
  status: ProviderVerificationStatus;
  note: string | null;
  reviewedNote: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
  acceptedOffers: number;
  provider: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    isVerified: boolean;
    profile: {
      title: string | null;
      region: Region;
      avatarUrl: string | null;
      avgRating: number;
      totalReviews: number;
      isTrusted: boolean;
    } | null;
  };
};

export async function getProviderVerificationSummary(
  userId: string,
): Promise<ProviderVerificationSummary> {
  const [user, acceptedOffers, latestRequest] = await prisma.$transaction([
    prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        accountType: true,
        profile: {
          select: {
            isTrusted: true,
          },
        },
      },
    }),
    prisma.offer.count({
      where: {
        providerId: userId,
        status: "ACCEPTED",
      },
    }),
    prisma.providerVerificationRequest.findFirst({
      where: {
        providerId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        status: true,
        note: true,
        reviewedNote: true,
        createdAt: true,
        reviewedAt: true,
      },
    }),
  ]);

  const isProvider = user?.accountType === "PROVIDER";
  const isTrusted = user?.profile?.isTrusted ?? false;
  const remainingOffers = Math.max(REQUIRED_ACCEPTED_OFFERS_FOR_VERIFICATION - acceptedOffers, 0);

  return {
    isProvider,
    isTrusted,
    acceptedOffers,
    requiredOffers: REQUIRED_ACCEPTED_OFFERS_FOR_VERIFICATION,
    remainingOffers,
    canRequest:
      isProvider &&
      !isTrusted &&
      acceptedOffers >= REQUIRED_ACCEPTED_OFFERS_FOR_VERIFICATION &&
      latestRequest?.status !== "PENDING",
    latestRequest,
  };
}

export async function requestProviderVerification(userId: string, note?: string) {
  const [user, acceptedOffers, pendingRequest] = await prisma.$transaction([
    prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
        isBanned: false,
      },
      select: {
        id: true,
        name: true,
        accountType: true,
        profile: {
          select: {
            isTrusted: true,
          },
        },
      },
    }),
    prisma.offer.count({
      where: {
        providerId: userId,
        status: "ACCEPTED",
      },
    }),
    prisma.providerVerificationRequest.findFirst({
      where: {
        providerId: userId,
        status: "PENDING",
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!user || user.accountType !== "PROVIDER") {
    throw new Error("هذا الإجراء لمقدمي الخدمات فقط");
  }

  if (user.profile?.isTrusted) {
    throw new Error("حسابك موثق رسمياً بالفعل");
  }

  if (acceptedOffers < REQUIRED_ACCEPTED_OFFERS_FOR_VERIFICATION) {
    const remaining = REQUIRED_ACCEPTED_OFFERS_FOR_VERIFICATION - acceptedOffers;
    throw new Error(`تحتاج إلى ${remaining} عروض مقبولة إضافية قبل طلب التوثيق الرسمي`);
  }

  if (pendingRequest) {
    throw new Error("لديك طلب توثيق قيد المراجعة حالياً");
  }

  return prisma.$transaction(async (tx) => {
    const request = await tx.providerVerificationRequest.create({
      data: {
        providerId: user.id,
        note: note?.trim() || null,
      },
      select: {
        id: true,
        providerId: true,
      },
    });

    const admins = await tx.user.findMany({
      where: {
        role: "ADMIN",
        deletedAt: null,
        isBanned: false,
      },
      select: {
        id: true,
      },
    });

    if (admins.length > 0) {
      await tx.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: "SYSTEM",
          message: `طلب توثيق رسمي جديد من مقدم الخدمة: ${user.name}`,
          link: "/admin/verification",
        })),
      });
    }

    return request;
  });
}

export async function getAdminProviderVerificationRequests({
  status,
}: {
  status?: ProviderVerificationStatus;
} = {}): Promise<AdminProviderVerificationRequest[]> {
  const requests = await prisma.providerVerificationRequest.findMany({
    where: {
      ...(status ? { status } : {}),
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 80,
    select: {
      id: true,
      status: true,
      note: true,
      reviewedNote: true,
      createdAt: true,
      reviewedAt: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isVerified: true,
          profile: {
            select: {
              title: true,
              region: true,
              avatarUrl: true,
              avgRating: true,
              totalReviews: true,
              isTrusted: true,
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
        },
      },
    },
  });

  return requests.map((request) => ({
    id: request.id,
    status: request.status,
    note: request.note,
    reviewedNote: request.reviewedNote,
    createdAt: request.createdAt,
    reviewedAt: request.reviewedAt,
    acceptedOffers: request.provider.offers.length,
    provider: {
      id: request.provider.id,
      name: request.provider.name,
      email: request.provider.email,
      phone: request.provider.phone,
      isVerified: request.provider.isVerified,
      profile: request.provider.profile,
    },
  }));
}

export async function reviewProviderVerificationRequest({
  requestId,
  adminId,
  decision,
  reviewedNote,
}: {
  requestId: string;
  adminId: string;
  decision: Exclude<ProviderVerificationStatus, "PENDING">;
  reviewedNote?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.providerVerificationRequest.findUnique({
      where: {
        id: requestId,
      },
      select: {
        id: true,
        status: true,
        providerId: true,
        provider: {
          select: {
            name: true,
            profile: {
              select: {
                isTrusted: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      throw new Error("طلب التوثيق غير موجود");
    }

    if (request.status !== "PENDING") {
      throw new Error("تمت مراجعة طلب التوثيق مسبقاً");
    }

    const updatedRequest = await tx.providerVerificationRequest.update({
      where: {
        id: request.id,
      },
      data: {
        status: decision,
        reviewedNote: reviewedNote?.trim() || null,
        reviewedAt: new Date(),
      },
      select: {
        id: true,
        providerId: true,
        status: true,
      },
    });

    if (decision === "APPROVED") {
      await tx.profile.update({
        where: {
          userId: request.providerId,
        },
        data: {
          isTrusted: true,
        },
      });
    }

    await tx.notification.create({
      data: {
        userId: request.providerId,
        type: "SYSTEM",
        message:
          decision === "APPROVED"
            ? "تم توثيق حسابك رسمياً من الإدارة"
            : reviewedNote?.trim()
              ? `لم يتم قبول طلب التوثيق حالياً: ${reviewedNote.trim()}`
              : "لم يتم قبول طلب التوثيق حالياً. يمكنك مراجعة بروفايلك ثم إعادة الطلب لاحقاً",
        link: "/dashboard/profile",
      },
    });

    await tx.auditLog.create({
      data: {
        userId: adminId,
        action:
          decision === "APPROVED"
            ? "APPROVE_PROVIDER_VERIFICATION"
            : "REJECT_PROVIDER_VERIFICATION",
        entityType: "ProviderVerificationRequest",
        entityId: request.id,
        metadata: {
          providerId: request.providerId,
          providerName: request.provider.name,
        },
      },
    });

    return updatedRequest;
  });
}
