"use server";

import type { ReportStatus } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";

import type { ActionResult } from "@/actions/auth.actions";
import { logAudit } from "@/lib/audit";
import { requireAdmin } from "@/lib/authGuards";
import { sanitizeText } from "@/lib/sanitize";
import {
  adminSoftDeleteListing,
  setListingFeatured,
  setListingStatus,
  updateListingReportStatus,
} from "@/services/admin-store.service";

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

async function setListingFeaturedAction(
  listingId: string,
  isFeatured: boolean,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
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

async function updateListingReportStatusAction(
  reportId: string,
  status: ReportStatus,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
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
