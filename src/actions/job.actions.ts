"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import type { ActionResult } from "@/actions/auth.actions";
import { logAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { requireClient, requireNotBanned } from "@/lib/authGuards";
import { rateLimiters } from "@/lib/rateLimit";
import { sanitizeText } from "@/lib/sanitize";
import { createJobSchema, updateJobSchema, type CreateJobInput } from "@/schemas/job.schema";
import {
  closeJob,
  createJob,
  softDeleteJob,
  toggleSavedJob,
  updateJob,
} from "@/services/job.service";

export type JobActionResult = ActionResult & {
  jobId?: string;
  isSaved?: boolean;
};

export async function createJobAction(input: CreateJobInput): Promise<JobActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  const parsed = createJobSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "حدث خطأ، حاول مرة أخرى",
    };
  }

  try {
    await requireClient();
    await requireNotBanned();
    const limit = await rateLimiters.createJob(session.user.id);

    if (!limit.success) {
      return {
        ok: false,
        message: "تم تجاوز عدد الطلبات المسموح خلال الساعة. حاول لاحقاً",
      };
    }

    const job = await createJob(sanitizeJobInput(parsed.data), session.user.id);
    revalidateTag("jobs", "max");
    revalidatePath("/jobs");
    revalidatePath("/dashboard/jobs");
    logAudit("CREATE_JOB", { userId: session.user.id, entityType: "JobPost", entityId: job.id });

    return { ok: true, message: "تم نشر طلبك بنجاح 🎉", jobId: job.id };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}

export async function updateJobAction(id: string, input: CreateJobInput): Promise<JobActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  const parsed = updateJobSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "حدث خطأ، حاول مرة أخرى",
    };
  }

  try {
    await requireNotBanned();
    await updateJob(id, sanitizeJobInput(parsed.data), session.user.id);
    revalidateTag("jobs", "max");
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${id}`);
    revalidatePath("/dashboard/jobs");
    logAudit("UPDATE_JOB", { userId: session.user.id, entityType: "JobPost", entityId: id });

    return { ok: true, message: "تم حفظ التعديلات بنجاح", jobId: id };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}

export async function closeJobAction(id: string): Promise<JobActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  try {
    await requireNotBanned();
    await closeJob(id, session.user.id);
    revalidateTag("jobs", "max");
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${id}`);
    revalidatePath("/dashboard/jobs");
    logAudit("CLOSE_JOB", { userId: session.user.id, entityType: "JobPost", entityId: id });

    return { ok: true, message: "تم إغلاق الطلب" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}

export async function deleteJobAction(id: string): Promise<JobActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  try {
    await requireNotBanned();
    await softDeleteJob(id, session.user.id);
    revalidateTag("jobs", "max");
    revalidatePath("/jobs");
    revalidatePath("/dashboard/jobs");
    logAudit("DELETE_JOB", { userId: session.user.id, entityType: "JobPost", entityId: id });

    return { ok: true, message: "تم حذف الطلب" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}

export async function toggleSaveJobAction(id: string): Promise<JobActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  try {
    await requireNotBanned();
    const isSaved = await toggleSavedJob(id, session.user.id);
    revalidatePath(`/jobs/${id}`);
    revalidatePath("/dashboard/saved");

    return {
      ok: true,
      message: isSaved ? "تم حفظ الطلب" : "تم إزالة الطلب من المحفوظات",
      isSaved,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}

function sanitizeJobInput(input: CreateJobInput): CreateJobInput {
  return {
    ...input,
    title: sanitizeText(input.title),
    description: sanitizeText(input.description),
    budget: sanitizeText(input.budget ?? ""),
    duration: sanitizeText(input.duration ?? ""),
    expiresAt: sanitizeText(input.expiresAt ?? ""),
  };
}
