import { prisma } from "@/lib/prisma";
import type { CreateListingReportInput } from "@/schemas/listing-report.schema";

export async function createListingReport(
  input: CreateListingReportInput,
  reporterId: string,
) {
  const listing = await prisma.listing.findFirst({
    where: {
      id: input.listingId,
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      sellerId: true,
    },
  });

  if (!listing) {
    throw new Error("العنصر غير متاح أو تم حذفه");
  }

  if (listing.sellerId === reporterId) {
    throw new Error("لا يمكنك الإبلاغ عن عنصر من متجرك");
  }

  const existing = await prisma.listingReport.findUnique({
    where: {
      reporterId_listingId: {
        reporterId,
        listingId: listing.id,
      },
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    throw new Error("أرسلت بلاغاً على هذا العنصر مسبقاً");
  }

  return prisma.listingReport.create({
    data: {
      listingId: listing.id,
      reporterId,
      reason: input.reason,
      details: input.details || null,
    },
    select: {
      id: true,
      listingId: true,
    },
  });
}
