import type { ListingStatus, ListingType, OrderStatus, Prisma, ReportStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { sanitizeSearchQuery } from "@/lib/sanitize";

const ADMIN_STORE_PAGE_SIZE = 20;

export async function getAdminStoreOverview() {
  const [
    totalListings,
    activeListings,
    pausedListings,
    soldOutListings,
    totalOrders,
    pendingOrders,
    completedOrders,
    pendingReports,
  ] = await prisma.$transaction([
    prisma.listing.count({ where: { deletedAt: null } }),
    prisma.listing.count({ where: { deletedAt: null, status: "ACTIVE" } }),
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
