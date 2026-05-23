import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getNavigationSummary } from "@/services/navigation.service";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const summary = await getNavigationSummary(session.user.id);

  return NextResponse.json(summary);
}
