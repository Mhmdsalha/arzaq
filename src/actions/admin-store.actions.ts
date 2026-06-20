"use server";

import type { OrderStatus, ReportStatus } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";

import type { ActionResult } from "@/actions/auth.actions";
import { logAudit } from "@/lib/audit";
import { requireAdmin } from "@/lib/authGuards";
import { rateLimiters } from "@/lib/rateLimit";
import { sanitizeText } from "@/lib/sanitize";
import {
  approveListing,
  adminUpdateStoreOrderStatus,
  adminSoftDeleteListing,
  rejectListing,
  requestListingEdits,
  setListingFeatured,
  setListingStatus,
  updateListingReportStatus,
} from "@/services/admin-store.service";

const orderStatusValues: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "DISPUTED",
];

export async function setListingFeaturedFormAction(formData: FormData): Promise<void> {
  await setListingFeaturedAction(
    String(formData.get("listingId") ?? ""),
    String(formData.get("isFeatured") ?? "") === "true",
  );
}

export async function setListingStatusFormAction(formData: FormData): Promise<void> {
  const status = String(formData.get("status") ?? "");

  if (status !== "ACTIVE" && status !== "PAUSED") {
    return;
  }

  await setListingStatusAction(String(formData.get("listingId") ?? ""), status);
}

export async function adminDeleteListingFormAction(formData: FormData): Promise<void> {
  await adminDeleteListingAction(String(formData.get("listingId") ?? ""));
}

export async function reviewListingFormAction(formData: FormData): Promise<void> {
  const decision = String(formData.get("decision") ?? "");
  const listingId = String(formData.get("listingId") ?? "");
  const note = sanitizeText(String(formData.get("reviewNote") ?? ""));

  if (!["APPROVE", "NEEDS_EDIT", "REJECT"].includes(decision)) {
    return;
  }

  await reviewListingAction(listingId, decision as "APPROVE" | "NEEDS_EDIT" | "REJECT", note);
}

export async function updateListingReportStatusFormAction(formData: FormData): Promise<void> {
  const status = String(formData.get("status") ?? "");

  if (!["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"].includes(status)) {
    return;
  }

  await updateListingReportStatusAction(
    String(formData.get("reportId") ?? ""),
    status as ReportStatus,
  );
}

export async function adminUpdateStoreOrderStatusFormAction(formData: FormData): Promise<void> {
  const orderId = sanitizeText(String(formData.get("orderId") ?? ""));
  const status = String(formData.get("status") ?? "") as OrderStatus;

  if (!orderStatusValues.includes(status)) {
    return;
  }

  try {
    const session = await requireAdmin();
    await assertAdminActionAllowed(session.user.id);
    const order = await adminUpdateStoreOrderStatus(orderId, status);
    revalidatePath("/admin/store/orders");
    revalidatePath("/admin/store");
    revalidatePath("/dashboard/store");
    revalidatePath("/dashboard/orders");
    logAudit("UPDATE_ORDER_STATUS", {
      userId: session.user.id,
      entityType: "Order",
      entityId: order.id,
      metadata: { status: order.status, source: "admin" },
    });
  } catch (error) {
    console.error("Failed to update store order status", error);
  }
}

async function setListingFeaturedAction(
  listingId: string,
  isFeatured: boolean,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await assertAdminActionAllowed(session.user.id);
    const listing = await setListingFeatured(sanitizeText(listingId), isFeatured);
    revalidateStoreAdminPaths(listing.id);
    logAudit("UPDATE_LISTING", {
      userId: session.user.id,
      entityType: "Listing",
      entityId: listing.id,
      metadata: { isFeatured },
    });

    return { ok: true, message: isFeatured ? "تم تمييز العنصر" : "تم إلغاء التمييز" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
    };
  }
}

async function setListingStatusAction(
  listingId: string,
  status: "ACTIVE" | "PAUSED",
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await assertAdminActionAllowed(session.user.id);
    const listing = await setListingStatus(sanitizeText(listingId), status);
    revalidateStoreAdminPaths(listing.id);
    logAudit("UPDATE_LISTING", {
      userId: session.user.id,
      entityType: "Listing",
      entityId: listing.id,
      metadata: { status },
    });

    return { ok: true, message: status === "ACTIVE" ? "تم تفعيل العنصر" : "تم إيقاف العنصر" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
    };
  }
}

async function adminDeleteListingAction(listingId: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await assertAdminActionAllowed(session.user.id);
    const listing = await adminSoftDeleteListing(sanitizeText(listingId));
    revalidateStoreAdminPaths(listing.id);
    logAudit("DELETE_LISTING", {
      userId: session.user.id,
      entityType: "Listing",
      entityId: listing.id,
    });

    return { ok: true, message: "تم حذف العنصر من المتجر" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
    };
  }
}

async function reviewListingAction(
  listingId: string,
  decision: "APPROVE" | "NEEDS_EDIT" | "REJECT",
  note?: string,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await assertAdminActionAllowed(session.user.id);
    const cleanListingId = sanitizeText(listingId);
    const listing =
      decision === "APPROVE"
        ? await approveListing(cleanListingId)
        : decision === "NEEDS_EDIT"
          ? await requestListingEdits(cleanListingId, note)
          : await rejectListing(cleanListingId, note);

    revalidateStoreAdminPaths(listing.id);
    logAudit("REVIEW_LISTING", {
      userId: session.user.id,
      entityType: "Listing",
      entityId: listing.id,
      metadata: { decision, note },
    });

    return {
      ok: true,
      message:
        decision === "APPROVE"
          ? "تمت الموافقة على العنصر"
          : decision === "NEEDS_EDIT"
            ? "تم إرسال طلب تعديل للبائع"
            : "تم رفض العنصر",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
    };
  }
}

async function updateListingReportStatusAction(
  reportId: string,
  status: ReportStatus,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await assertAdminActionAllowed(session.user.id);
    const report = await updateListingReportStatus(sanitizeText(reportId), status);
    revalidatePath("/admin/store/reports");
    revalidatePath(`/store/${report.listingId}`);
    logAudit("REVIEW_REPORT", {
      userId: session.user.id,
      entityType: "ListingReport",
      entityId: report.id,
      metadata: { status },
    });

    return { ok: true, message: "تم تحديث حالة البلاغ" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
    };
  }
}

function revalidateStoreAdminPaths(listingId?: string) {
  revalidateTag("store", "max");
  revalidatePath("/store");
  revalidatePath("/admin/store");
  revalidatePath("/admin/store/listings");

  if (listingId) {
    revalidatePath(`/store/${listingId}`);
  }
}

async function assertAdminActionAllowed(userId: string) {
  const limit = await rateLimiters.adminAction(userId);

  if (!limit.success) {
    throw new Error("تم تجاوز عدد عمليات الإدارة، حاول لاحقاً");
  }
}
