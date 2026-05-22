"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/actions/auth.actions";
import { auth } from "@/lib/auth";
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
    const job = await createJob(parsed.data, session.user.id);
    revalidatePath("/jobs");
    revalidatePath("/dashboard/jobs");

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
    await updateJob(id, parsed.data, session.user.id);
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${id}`);
    revalidatePath("/dashboard/jobs");

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
    await closeJob(id, session.user.id);
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${id}`);
    revalidatePath("/dashboard/jobs");

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
    await softDeleteJob(id, session.user.id);
    revalidatePath("/jobs");
    revalidatePath("/dashboard/jobs");

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
    const isSaved = await toggleSavedJob(id, session.user.id);
    revalidatePath("/jobs");
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
