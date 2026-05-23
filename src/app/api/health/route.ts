import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { R2_BUCKET, r2Client } from "@/lib/r2";

export async function GET() {
  const results: Record<"database" | "storage", string> = {
    database: "not checked",
    storage: "not checked",
  };

  try {
    await prisma.$queryRaw`SELECT 1`;

    const [categories, skills, users] = await prisma.$transaction([
      prisma.category.count(),
      prisma.skill.count(),
      prisma.user.count(),
    ]);

    results.database = `connected (${categories} categories, ${skills} skills, ${users} users)`;
  } catch {
    results.database = "connection failed";
  }

  try {
    await r2Client.send(new HeadBucketCommand({ Bucket: R2_BUCKET }));
    results.storage = `connected (bucket: ${R2_BUCKET})`;
  } catch {
    results.storage = "connection failed";
  }

  const allOk = Object.values(results).every((value) => value.startsWith("connected"));

  return NextResponse.json(
    {
      status: allOk ? "ok" : "error",
      ...results,
    },
    { status: allOk ? 200 : 500 },
  );
}
