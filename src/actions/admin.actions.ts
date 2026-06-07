"use server";

import type { ReportStatus } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";

import type { ActionResult } from "@/actions/auth.actions";
import { logAudit } from "@/lib/audit";
import { requireAdmin } from "@/lib/authGuards";
import { rateLimiters } from "@/lib/rateLimit";
import { sanitizeEmail, sanitizePhone, sanitizeText } from "@/lib/sanitize";
import {
  approveJobPost,
  createAdminUser,
  adminSoftDeleteJob,
  requestJobEdit,
  setProviderTrusted,
  setUserBanned,
  setUserVerified,
  updateReportReview,
} from "@/services/admin.service";
import { createAdminSchema, jobRejectionSchema } from "@/schemas/admin.schema";

export async function setUserBanAction(userId: string, isBanned: boolean): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await assertAdminActionAllowed(session.user.id);
    const user = await setUserBanned(sanitizeText(userId), isBanned);

    revalidatePath("/admin/users");
    logAudit(isBanned ? "BAN_USER" : "UNBAN_USER", {
      userId: session.user.id,
      entityType: "User",
      entityId: user.id,
    });

    return { ok: true, message: isBanned ? "تم حظر المستخدم" : "تم فك حظر المستخدم" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
    };
  }
}

export async function setUserBanFormAction(formData: FormData): Promise<void> {
  const userId = String(formData.get("userId") ?? "");
  const isBanned = String(formData.get("isBanned") ?? "") === "true";

  await setUserBanAction(userId, isBanned);
}

export async function createAdminAccountAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await assertAdminActionAllowed(session.user.id);
    const parsed = createAdminSchema.safeParse({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
    }

    const admin = await createAdminUser({
      ...parsed.data,
      name: sanitizeText(parsed.data.name),
      email: sanitizeEmail(parsed.data.email),
      phone: parsed.data.phone ? sanitizePhone(parsed.data.phone) || undefined : undefined,
    });

    revalidatePath("/admin/admins");
    logAudit("CREATE_ADMIN", {
      userId: session.user.id,
      entityType: "User",
      entityId: admin.id,
    });

    return { ok: true, message: "تم إنشاء حساب الأدمن بنجاح" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
    };
  }
}

export async function createAdminAccountFormAction(formData: FormData): Promise<void> {
  await createAdminAccountAction(formData);
}

export async function setUserVerifiedAction(
  userId: string,
  isVerified: boolean,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await assertAdminActionAllowed(session.user.id);
    const user = await setUserVerified(sanitizeText(userId), isVerified);

    revalidatePath("/admin/users");
    logAudit(isVerified ? "VERIFY_ACCOUNT" : "UNVERIFY_ACCOUNT", {
      userId: session.user.id,
      entityType: "User",
      entityId: user.id,
    });

    return { ok: true, message: isVerified ? "تم توثيق الحساب" : "تم إلغاء توثيق الحساب" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
    };
  }
}

export async function setUserVerifiedFormAction(formData: FormData): Promise<void> {
  const userId = String(formData.get("userId") ?? "");
  const isVerified = String(formData.get("isVerified") ?? "") === "true";

  await setUserVerifiedAction(userId, isVerified);
}

export async function setProviderTrustAction(
  userId: string,
  isTrusted: boolean,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await assertAdminActionAllowed(session.user.id);
    const profile = await setProviderTrusted(sanitizeText(userId), isTrusted);

    revalidatePath("/admin/users");
    revalidatePath("/providers");
    logAudit(isTrusted ? "TRUST_PROVIDER" : "UNTRUST_PROVIDER", {
      userId: session.user.id,
      entityType: "Profile",
      entityId: profile.userId,
    });

    return { ok: true, message: isTrusted ? "تم توثيق مقدم الخدمة" : "تم إلغاء التوثيق" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
    };
  }
}

export async function setProviderTrustFormAction(formData: FormData): Promise<void> {
  const userId = String(formData.get("userId") ?? "");
  const isTrusted = String(formData.get("isTrusted") ?? "") === "true";

  await setProviderTrustAction(userId, isTrusted);
}

export async function adminDeleteJobAction(jobId: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await assertAdminActionAllowed(session.user.id);
    const job = await adminSoftDeleteJob(sanitizeText(jobId));

    revalidateTag("jobs", "max");
    revalidatePath("/admin/jobs");
    revalidatePath(`/admin/jobs/${job.id}`);
    revalidatePath("/jobs");
    logAudit("ADMIN_DELETE_JOB", {
      userId: session.user.id,
      entityType: "JobPost",
      entityId: job.id,
    });

    return { ok: true, message: "تم إخفاء الطلب من المنصة" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
    };
  }
}

export async function adminDeleteJobFormAction(formData: FormData): Promise<void> {
  const jobId = String(formData.get("jobId") ?? "");

  await adminDeleteJobAction(jobId);
}

export async function approveJobAction(jobId: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await assertAdminActionAllowed(session.user.id);
    const job = await approveJobPost(sanitizeText(jobId));

    revalidateTag("jobs", "max");
    revalidatePath("/admin/jobs");
    revalidatePath(`/admin/jobs/${job.id}`);
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${job.id}`);
    logAudit("APPROVE_JOB", {
      userId: session.user.id,
      entityType: "JobPost",
      entityId: job.id,
    });

    return { ok: true, message: "تم اعتماد الطلب ونشره" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
    };
  }
}

export async function approveJobFormAction(formData: FormData): Promise<void> {
  const jobId = String(formData.get("jobId") ?? "");

  await approveJobAction(jobId);
}

export async function requestJobEditAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await assertAdminActionAllowed(session.user.id);
    const parsed = jobRejectionSchema.safeParse({
      jobId: String(formData.get("jobId") ?? ""),
      note: sanitizeText(String(formData.get("note") ?? "")),
    });

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
    }

    const job = await requestJobEdit(parsed.data.jobId, parsed.data.note);

    revalidateTag("jobs", "max");
    revalidatePath("/admin/jobs");
    revalidatePath(`/admin/jobs/${job.id}`);
    revalidatePath("/dashboard/jobs");
    logAudit("REQUEST_JOB_EDIT", {
      userId: session.user.id,
      entityType: "JobPost",
      entityId: job.id,
    });

    return { ok: true, message: "تم إرسال طلب التعديل لصاحب الطلب" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
    };
  }
}

export async function requestJobEditFormAction(formData: FormData): Promise<void> {
  await requestJobEditAction(formData);
}

export async function updateReportStatusAction(
  reportId: string,
  status: ReportStatus,
  resolvedNote?: string,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await assertAdminActionAllowed(session.user.id);
    if (!["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"].includes(status)) {
      return { ok: false, message: "حالة البلاغ غير صحيحة" };
    }

    const report = await updateReportReview(
      sanitizeText(reportId),
      status,
      resolvedNote ? sanitizeText(resolvedNote) : undefined,
    );

    revalidatePath("/admin/reports");
    logAudit("REVIEW_REPORT", {
      userId: session.user.id,
      entityType: "Report",
      entityId: report.id,
      metadata: {
        status,
        targetType: report.targetType,
        targetId: report.targetId,
      },
    });

    return { ok: true, message: "تم تحديث البلاغ" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
    };
  }
}

export async function updateReportStatusFormAction(formData: FormData): Promise<void> {
  const reportId = String(formData.get("reportId") ?? "");
  const status = String(formData.get("status") ?? "REVIEWED") as ReportStatus;
  const resolvedNote = String(formData.get("resolvedNote") ?? "");

  await updateReportStatusAction(reportId, status, resolvedNote);
}

async function assertAdminActionAllowed(userId: string) {
  const limit = await rateLimiters.adminAction(userId);

  if (!limit.success) {
    throw new Error("تم تجاوز عدد عمليات الإدارة، حاول لاحقاً");
  }
}
