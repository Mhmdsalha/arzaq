import { NextRequest, NextResponse } from "next/server";

import { sanitizeInt, sanitizeSearchQuery, sanitizeUrlParam } from "@/lib/sanitize";
import { jobFiltersSchema } from "@/schemas/job.schema";
import { getCachedJobsWithFilters } from "@/services/job.service";

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parsedFilters = jobFiltersSchema.safeParse({
    q: sanitizeSearchQuery(searchParams.get("q") ?? undefined) || undefined,
    category: sanitizeUrlParam(searchParams.get("category") ?? undefined) || undefined,
    region: sanitizeUrlParam(searchParams.get("region") ?? undefined) || undefined,
    workMode: sanitizeUrlParam(searchParams.get("workMode") ?? undefined) || undefined,
    urgent: sanitizeUrlParam(searchParams.get("urgent") ?? undefined) || undefined,
    page: sanitizeInt(searchParams.get("page") ?? undefined, 1, 1000),
  });

  if (!parsedFilters.success) {
    return NextResponse.json({ error: "بيانات الفلترة غير صحيحة" }, { status: 400 });
  }

  const jobs = await getCachedJobsWithFilters(parsedFilters.data);

  return NextResponse.json(jobs, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
