import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { R2_BUCKET, r2Client } from "@/lib/r2";

export async function GET() {
  const results: Record<"database" | "storage", "connected" | "failed"> = {
    database: "failed",
    storage: "failed",
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    results.database = "connected";
  } catch {
    results.database = "failed";
  }

  try {
    await r2Client.send(new HeadBucketCommand({ Bucket: R2_BUCKET }));
    results.storage = "connected";
  } catch {
    results.storage = "failed";
  }

  const allOk = Object.values(results).every((value) => value === "connected");

  return NextResponse.json(
    {
      status: allOk ? "ok" : "error",
      ...results,
    },
    {
      status: allOk ? 200 : 500,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
