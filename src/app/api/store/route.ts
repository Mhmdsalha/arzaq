import type { DeliveryMethod, ListingType, Region } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getCachedListingsWithFilters, getListingsWithFilters, type ListingFiltersInput } from "@/services/listing.service";

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filters: ListingFiltersInput = {
    q: getOptional(searchParams, "q"),
    type: parseEnum<ListingType>(searchParams.get("type"), ["SERVICE", "PHYSICAL"]),
    category: normalizeAll(searchParams.get("category")),
    region: parseEnum<Region>(searchParams.get("region"), [
      "NORTH_GAZA",
      "GAZA_CITY",
      "CENTRAL",
      "KHAN_YOUNIS",
      "RAFAH",
      "ONLINE",
    ]),
    delivery: parseEnum<DeliveryMethod>(searchParams.get("delivery"), [
      "IN_PERSON",
      "DELIVERY",
      "ONLINE",
      "WHATSAPP",
    ]),
    min: parsePrice(searchParams.get("min")),
    max: parsePrice(searchParams.get("max")),
    sort:
      parseEnum<NonNullable<ListingFiltersInput["sort"]>>(searchParams.get("sort"), [
        "newest",
        "price_asc",
        "price_desc",
        "popular",
      ]) ?? "newest",
    page: parsePage(searchParams.get("page")),
  };

  const session = await auth();
  const listings = session?.user?.id
    ? await getListingsWithFilters(filters, session.user.id)
    : await getCachedListingsWithFilters(filters);

  return NextResponse.json(listings, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}

function getOptional(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key)?.trim();
  return value || undefined;
}

function normalizeAll(value: string | null) {
  return !value || value === "all" ? undefined : value;
}

function parsePrice(value: string | null) {
  if (!value) {
    return undefined;
  }

  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : undefined;
}

function parsePage(value: string | null) {
  const page = Number(value ?? "1");
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function parseEnum<T extends string>(value: string | null, values: readonly T[]) {
  return value && values.includes(value as T) ? (value as T) : undefined;
}
