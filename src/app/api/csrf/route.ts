import { NextResponse } from "next/server";

import { generateCSRFToken } from "@/lib/csrf";

export function GET() {
  return NextResponse.json({ token: generateCSRFToken() });
}
