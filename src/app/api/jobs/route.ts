import { NextRequest, NextResponse } from "next/server";

import { jobFiltersSchema } from "@/schemas/job.schema";
import { getCachedJobsWithFilters } from "@/services/job.service";

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parsedFilters = jobFiltersSchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    region: searchParams.get("region") ?? undefined,
    workMode: searchParams.get("workMode") ?? undefined,
    urgent: searchParams.get("urgent") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    page: searchParams.get("page") ?? undefined,
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
