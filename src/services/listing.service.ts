import type { DeliveryMethod, ListingType, Prisma, Region } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { cache } from "react";

import { isDatabaseConnectionError, isDatabaseTemporarilyUnavailable, prisma } from "@/lib/prisma";
import { sanitizeSearchQuery } from "@/lib/sanitize";
import type {
  ListingCategoryOption,
  ListingDetailsData,
  ListingListItem,
  PaginatedListings,
} from "@/types/store";

const DEFAULT_STORE_PAGE_SIZE = 12;

export type ListingFiltersInput = {
  q?: string;
  type?: ListingType;
  category?: string;
  region?: Region;
  delivery?: DeliveryMethod;
  min?: number;
  max?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "popular";
  page?: number;
  pageSize?: number;
};

const cachedListingFilterOptions = unstable_cache(
  async () => getListingFilterOptions(),
  ["listing-filter-options"],
  {
    revalidate: 60,
    tags: ["store"],
  },
);

const cachedListingsWithFilters = unstable_cache(
  async (serializedFilters: string) => {
    return getListingsWithFilters(JSON.parse(serializedFilters) as ListingFiltersInput);
  },
  ["listings-with-filters"],
  {
    revalidate: 60,
    tags: ["store"],
  },
);

export function getCachedListingFilterOptions(): Promise<ListingCategoryOption[]> {
  return cachedListingFilterOptions();
}

export function getCachedListingsWithFilters(
  filters: ListingFiltersInput,
): Promise<PaginatedListings<ListingListItem>> {
  return cachedListingsWithFilters(serializeListingFilters(filters));
}

export const getListingFilterOptions = cache(async (): Promise<ListingCategoryOption[]> => {
  if (!hasDatabaseUrl() || isDatabaseTemporarilyUnavailable()) {
    return [];
  }

  try {
    return await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        icon: true,
      },
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return [];
    }

    throw error;
  }
});

export async function getListingsWithFilters(
  filters: ListingFiltersInput,
  userId?: string,
): Promise<PaginatedListings<ListingListItem>> {
  const page = Math.max(filters.page ?? 1, 1);
  const pageSize = filters.pageSize ?? DEFAULT_STORE_PAGE_SIZE;

  if (!hasDatabaseUrl() || isDatabaseTemporarilyUnavailable()) {
    return getEmptyListings(page, pageSize);
  }

  const where = buildListingsWhere(filters);

  try {
    const [items, total] = await prisma.$transaction([
      prisma.listing.findMany({
        where,
        orderBy: buildListingOrderBy(filters.sort),
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: listingListSelect(userId),
      }),
      prisma.listing.count({ where }),
    ]);

    return {
      items: items.map((listing) => mapListingListItem(listing, userId)),
      total,
      page,
      pageSize,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
    };
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return getEmptyListings(page, pageSize);
    }

    throw error;
  }
}

export const getListingById = cache(
  async (id: string, userId?: string): Promise<ListingDetailsData | null> => {
    if (!hasDatabaseUrl() || isDatabaseTemporarilyUnavailable()) {
      return null;
    }

    const listing = await prisma.listing
      .findFirst({
        where: {
          id,
          deletedAt: null,
          status: "ACTIVE",
        },
        select: {
          ...listingListSelect(userId),
          seller: {
            select: {
              id: true,
              name: true,
              isVerified: true,
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
        },
      })
      .catch((error: unknown) => {
        if (isDatabaseConnectionError(error)) {
          return null;
        }

        throw error;
      });

    if (!listing) {
      return null;
    }

    const listItem = mapListingListItem(listing, userId);

    return {
      ...listItem,
      seller: {
        ...listItem.seller,
        avgRating: listing.seller.profile?.avgRating ?? 0,
        totalReviews: listing.seller.profile?.totalReviews ?? 0,
        region: listing.seller.profile?.region ?? null,
        createdAt: listing.seller.createdAt,
        isVerified: listing.seller.isVerified,
      },
      isOwner: listing.seller.id === userId,
    };
  },
);

export const getSimilarListings = cache(
  async (
    categoryId: string,
    excludeId: string,
    userId?: string,
  ): Promise<ListingListItem[]> => {
    if (!hasDatabaseUrl() || isDatabaseTemporarilyUnavailable()) {
      return [];
    }

    const listings = await prisma.listing
      .findMany({
        where: {
          categoryId,
          id: {
            not: excludeId,
          },
          deletedAt: null,
          status: "ACTIVE",
        },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 4,
        select: listingListSelect(userId),
      })
      .catch((error: unknown) => {
        if (isDatabaseConnectionError(error)) {
          return [];
        }

        throw error;
      });

    return listings.map((listing) => mapListingListItem(listing, userId));
  },
);

export async function incrementListingViews(id: string, viewerId?: string) {
  if (!hasDatabaseUrl()) {
    return;
  }

  await prisma.listing.updateMany({
    where: {
      id,
      deletedAt: null,
      ...(viewerId ? { sellerId: { not: viewerId } } : {}),
    },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });
}

function serializeListingFilters(filters: ListingFiltersInput): string {
  return JSON.stringify({
    q: filters.q ?? "",
    type: filters.type ?? "",
    category: filters.category ?? "",
    region: filters.region ?? "",
    delivery: filters.delivery ?? "",
    min: filters.min ?? "",
    max: filters.max ?? "",
    sort: filters.sort ?? "newest",
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? DEFAULT_STORE_PAGE_SIZE,
  });
}

function buildListingsWhere(filters: ListingFiltersInput): Prisma.ListingWhereInput {
  const query = filters.q ? sanitizeSearchQuery(filters.q) : "";

  return {
    deletedAt: null,
    status: "ACTIVE",
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.category ? { categoryId: filters.category } : {}),
    ...(filters.region ? { region: filters.region } : {}),
    ...(filters.delivery ? { deliveryMethod: filters.delivery } : {}),
    ...(typeof filters.min === "number" || typeof filters.max === "number"
      ? {
          price: {
            ...(typeof filters.min === "number" ? { gte: filters.min } : {}),
            ...(typeof filters.max === "number" ? { lte: filters.max } : {}),
          },
        }
      : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { tags: { has: query } },
          ],
        }
      : {}),
  };
}

function buildListingOrderBy(sort: ListingFiltersInput["sort"]): Prisma.ListingOrderByWithRelationInput[] {
  if (sort === "price_asc") {
    return [{ price: "asc" }, { createdAt: "desc" }];
  }

  if (sort === "price_desc") {
    return [{ price: "desc" }, { createdAt: "desc" }];
  }

  if (sort === "popular") {
    return [{ viewCount: "desc" }, { createdAt: "desc" }];
  }

  return [{ isFeatured: "desc" }, { createdAt: "desc" }];
}

function listingListSelect(userId?: string) {
  return {
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
    category: {
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        icon: true,
      },
    },
    seller: {
      select: {
        id: true,
        name: true,
        profile: {
          select: {
            avatarUrl: true,
            whatsapp: true,
            showWhatsapp: true,
            isTrusted: true,
          },
        },
      },
    },
    _count: {
      select: {
        orders: true,
      },
    },
    savedBy: userId
      ? {
          where: {
            userId,
          },
          select: {
            userId: true,
          },
          take: 1,
        }
      : false,
  } satisfies Prisma.ListingSelect;
}

type ListingListPayload = Prisma.ListingGetPayload<{
  select: ReturnType<typeof listingListSelect>;
}>;

function mapListingListItem(listing: ListingListPayload, userId?: string): ListingListItem {
  const showWhatsapp = listing.seller.profile?.showWhatsapp ?? false;

  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    type: listing.type,
    price: listing.price,
    priceLabel: listing.priceLabel,
    deliveryMethod: listing.deliveryMethod,
    deliveryTime: listing.deliveryTime,
    region: listing.region,
    quantity: listing.quantity,
    images: listing.images,
    tags: listing.tags,
    status: listing.status,
    viewCount: listing.viewCount,
    avgRating: listing.avgRating,
    totalReviews: listing.totalReviews,
    isFeatured: listing.isFeatured,
    createdAt: listing.createdAt,
    category: listing.category,
    seller: {
      id: listing.seller.id,
      name: listing.seller.name,
      avatarUrl: listing.seller.profile?.avatarUrl ?? null,
      isTrusted: listing.seller.profile?.isTrusted ?? false,
      whatsapp: showWhatsapp ? (listing.seller.profile?.whatsapp ?? null) : null,
      showWhatsapp,
    },
    ordersCount: listing._count.orders,
    isSaved: Boolean(userId && listing.savedBy.length > 0),
  };
}

function getEmptyListings(page: number, pageSize: number): PaginatedListings<ListingListItem> {
  return {
    items: [],
    total: 0,
    page,
    pageSize,
    totalPages: 1,
  };
}

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL?.trim());
}
