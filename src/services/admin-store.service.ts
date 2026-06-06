import type { ListingStatus, ListingType, OrderStatus, Prisma, ReportStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { sanitizeSearchQuery } from "@/lib/sanitize";

const ADMIN_STORE_PAGE_SIZE = 20;

export async function getAdminStoreOverview() {
  const [
    totalListings,
    activeListings,
    pendingReviewListings,
    needsEditListings,
    pausedListings,
    soldOutListings,
    totalOrders,
    pendingOrders,
    completedOrders,
    pendingReports,
  ] = await prisma.$transaction([
    prisma.listing.count({ where: { deletedAt: null } }),
    prisma.listing.count({ where: { deletedAt: null, status: "ACTIVE" } }),
    prisma.listing.count({ where: { deletedAt: null, status: "PENDING_REVIEW" } }),
    prisma.listing.count({ where: { deletedAt: null, status: "NEEDS_EDIT" } }),
    prisma.listing.count({ where: { deletedAt: null, status: "PAUSED" } }),
    prisma.listing.count({ where: { deletedAt: null, status: "SOLD_OUT" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.listingReport.count({ where: { status: "PENDING" } }),
  ]);

  return {
    totalListings,
    activeListings,
    pendingReviewListings,
    needsEditListings,
    pausedListings,
    soldOutListings,
    totalOrders,
    pendingOrders,
    completedOrders,
    pendingReports,
  };
}

export async function getAdminStoreListings({
  q,
  status,
  type,
  page = 1,
}: {
  q?: string;
  status?: ListingStatus;
  type?: ListingType;
  page?: number;
}) {
  const currentPage = Math.max(page, 1);
  const query = q ? sanitizeSearchQuery(q) : "";
  const where: Prisma.ListingWhereInput = {
    deletedAt: null,
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { seller: { name: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [listings, total] = await prisma.$transaction([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * ADMIN_STORE_PAGE_SIZE,
      take: ADMIN_STORE_PAGE_SIZE,
      select: {
        id: true,
        title: true,
        type: true,
        price: true,
        status: true,
        isFeatured: true,
        viewCount: true,
        createdAt: true,
        category: { select: { name: true } },
        seller: { select: { id: true, name: true, email: true } },
        _count: { select: { orders: true, reports: true } },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  return {
    listings,
    total,
    page: currentPage,
    totalPages: Math.max(Math.ceil(total / ADMIN_STORE_PAGE_SIZE), 1),
  };
}

export async function getAdminStoreListingById(listingId: string) {
  return prisma.listing.findFirst({
    where: {
      id: listingId,
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      price: true,
      priceLabel: true,
      deliveryMethod: true,
      deliveryTime: true,
      region: true,
      quantity: true,
      images: true,
      tags: true,
      status: true,
      viewCount: true,
      avgRating: true,
      totalReviews: true,
      isFeatured: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isVerified: true,
          isBanned: true,
          createdAt: true,
          profile: {
            select: {
              avatarUrl: true,
              whatsapp: true,
              showWhatsapp: true,
              isTrusted: true,
              avgRating: true,
              totalReviews: true,
              region: true,
            },
          },
        },
      },
      _count: {
        select: {
          orders: true,
          reports: true,
          savedBy: true,
          reviews: true,
        },
      },
    },
  });
}

export async function getAdminStoreOrders({
  q,
  status,
  page = 1,
}: {
  q?: string;
  status?: OrderStatus;
  page?: number;
}) {
  const currentPage = Math.max(page, 1);
  const query = q ? sanitizeSearchQuery(q) : "";
  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(query
      ? {
          OR: [
            { id: { contains: query, mode: "insensitive" } },
            { listing: { title: { contains: query, mode: "insensitive" } } },
            { listing: { seller: { name: { contains: query, mode: "insensitive" } } } },
            { buyer: { name: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * ADMIN_STORE_PAGE_SIZE,
      take: ADMIN_STORE_PAGE_SIZE,
      select: {
        id: true,
        quantity: true,
        totalPrice: true,
        status: true,
        contactMethod: true,
        createdAt: true,
        listing: {
          select: {
            id: true,
            title: true,
            seller: { select: { id: true, name: true } },
          },
        },
        buyer: { select: { id: true, name: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    total,
    page: currentPage,
    totalPages: Math.max(Math.ceil(total / ADMIN_STORE_PAGE_SIZE), 1),
  };
}

export async function getAdminStoreReports({
  status,
  page = 1,
}: {
  status?: ReportStatus;
  page?: number;
}) {
  const currentPage = Math.max(page, 1);
  const where: Prisma.ListingReportWhereInput = {
    ...(status ? { status } : {}),
  };

  const [reports, total] = await prisma.$transaction([
    prisma.listingReport.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * ADMIN_STORE_PAGE_SIZE,
      take: ADMIN_STORE_PAGE_SIZE,
      select: {
        id: true,
        reason: true,
        details: true,
        status: true,
        createdAt: true,
        listing: {
          select: {
            id: true,
            title: true,
            status: true,
            seller: { select: { id: true, name: true } },
          },
        },
        reporter: { select: { id: true, name: true } },
      },
    }),
    prisma.listingReport.count({ where }),
  ]);

  return {
    reports,
    total,
    page: currentPage,
    totalPages: Math.max(Math.ceil(total / ADMIN_STORE_PAGE_SIZE), 1),
  };
}

export async function setListingFeatured(listingId: string, isFeatured: boolean) {
  return prisma.listing.update({
    where: { id: listingId },
    data: { isFeatured },
    select: { id: true },
  });
}

export async function setListingStatus(listingId: string, status: "ACTIVE" | "PAUSED") {
  return prisma.listing.update({
    where: { id: listingId },
    data: { status },
    select: { id: true },
  });
}

export async function approveListing(listingId: string) {
  return prisma.$transaction(async (tx) => {
    const listing = await tx.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        title: true,
        type: true,
        quantity: true,
        sellerId: true,
      },
    });

    if (!listing) {
      throw new Error("العنصر غير موجود");
    }

    const nextStatus = listing.type === "PHYSICAL" && (listing.quantity ?? 0) === 0 ? "SOLD_OUT" : "ACTIVE";
    const updated = await tx.listing.update({
      where: { id: listing.id },
      data: { status: nextStatus },
      select: { id: true },
    });

    await tx.notification.create({
      data: {
        userId: listing.sellerId,
        type: "SYSTEM",
        message: `تمت الموافقة على عنصر المتجر: ${listing.title}`,
        link: `/dashboard/store`,
      },
    });

    return updated;
  });
}

export async function requestListingEdits(listingId: string, note?: string) {
  return reviewListingWithSellerNotification({
    listingId,
    status: "NEEDS_EDIT",
    messagePrefix: "تحتاج الإدارة تعديلات على عنصر المتجر",
    note,
  });
}

export async function rejectListing(listingId: string, note?: string) {
  return reviewListingWithSellerNotification({
    listingId,
    status: "REJECTED",
    messagePrefix: "تم رفض عنصر المتجر",
    note,
  });
}

async function reviewListingWithSellerNotification({
  listingId,
  status,
  messagePrefix,
  note,
}: {
  listingId: string;
  status: "NEEDS_EDIT" | "REJECTED";
  messagePrefix: string;
  note?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const listing = await tx.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        title: true,
        sellerId: true,
      },
    });

    if (!listing) {
      throw new Error("العنصر غير موجود");
    }

    const updated = await tx.listing.update({
      where: { id: listing.id },
      data: { status },
      select: { id: true },
    });

    await tx.notification.create({
      data: {
        userId: listing.sellerId,
        type: "SYSTEM",
        message: `${messagePrefix}: ${listing.title}${note ? ` - ${note}` : ""}`,
        link: `/dashboard/store/${listing.id}/edit`,
      },
    });

    return updated;
  });
}

export async function adminSoftDeleteListing(listingId: string) {
  return prisma.listing.update({
    where: { id: listingId },
    data: {
      deletedAt: new Date(),
      status: "DELETED",
    },
    select: { id: true },
  });
}

export async function updateListingReportStatus(reportId: string, status: ReportStatus) {
  return prisma.listingReport.update({
    where: { id: reportId },
    data: { status },
    select: {
      id: true,
      listingId: true,
    },
  });
}
