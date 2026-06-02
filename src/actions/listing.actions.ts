"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import type { ActionResult } from "@/actions/auth.actions";
import { logAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { requireNotBanned } from "@/lib/authGuards";
import { rateLimiters } from "@/lib/rateLimit";
import { sanitizeText, sanitizeUrl } from "@/lib/sanitize";
import {
  createListingSchema,
  listingIdSchema,
  updateListingSchema,
  type CreateListingInput,
  type ListingIdInput,
  type UpdateListingInput,
} from "@/schemas/listing.schema";
import {
  activateListing,
  createListing,
  pauseListing,
  softDeleteListing,
  updateListing,
} from "@/services/listing.service";

export type ListingActionResult = ActionResult & {
  listingId?: string;
};

export async function createListingAction(
  input: CreateListingInput,
): Promise<ListingActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  const parsed = createListingSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "بيانات العنصر غير صحيحة",
    };
  }

  try {
    await requireNotBanned();
    const limit = await rateLimiters.createListing(session.user.id);

    if (!limit.success) {
      return { ok: false, message: "تم تجاوز حد إضافة العناصر. حاول لاحقاً" };
    }

    const clean = sanitizeListingInput(parsed.data);
    const listing = await createListing(clean, session.user.id);
    revalidateStorePaths();
    logAudit("CREATE_LISTING", {
      userId: session.user.id,
      entityType: "Listing",
      entityId: listing.id,
    });

    return {
      ok: true,
      message: "تم إضافة العنصر إلى متجرك بنجاح",
      listingId: listing.id,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}

export async function updateListingAction(
  listingId: string,
  input: UpdateListingInput,
): Promise<ListingActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  const parsedId = listingIdSchema.safeParse({ listingId });
  const parsed = updateListingSchema.safeParse(input);

  if (!parsedId.success || !parsed.success) {
    return {
      ok: false,
      message:
        parsed.error?.issues[0]?.message ??
        parsedId.error?.issues[0]?.message ??
        "بيانات العنصر غير صحيحة",
    };
  }

  try {
    await requireNotBanned();
    const clean = sanitizeListingUpdateInput(parsed.data);
    const listing = await updateListing(parsedId.data.listingId, clean, session.user.id);
    revalidateStorePaths(parsedId.data.listingId);
    logAudit("UPDATE_LISTING", {
      userId: session.user.id,
      entityType: "Listing",
      entityId: listing.id,
    });

    return { ok: true, message: "تم حفظ التعديلات", listingId: listing.id };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}

export async function pauseListingAction(input: ListingIdInput): Promise<ListingActionResult> {
  return changeListingState(input, "pause");
}

export async function activateListingAction(input: ListingIdInput): Promise<ListingActionResult> {
  return changeListingState(input, "activate");
}

export async function deleteListingAction(input: ListingIdInput): Promise<ListingActionResult> {
  return changeListingState(input, "delete");
}

async function changeListingState(
  input: ListingIdInput,
  action: "pause" | "activate" | "delete",
): Promise<ListingActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  const parsed = listingIdSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "العنصر غير صحيح",
    };
  }

  try {
    await requireNotBanned();

    if (action === "pause") {
      await pauseListing(parsed.data.listingId, session.user.id);
    }

    if (action === "activate") {
      await activateListing(parsed.data.listingId, session.user.id);
    }

    if (action === "delete") {
      await softDeleteListing(parsed.data.listingId, session.user.id);
    }

    revalidateStorePaths(parsed.data.listingId);
    logAudit(
      action === "pause"
        ? "PAUSE_LISTING"
        : action === "activate"
          ? "ACTIVATE_LISTING"
          : "DELETE_LISTING",
      {
        userId: session.user.id,
        entityType: "Listing",
        entityId: parsed.data.listingId,
      },
    );

    return {
      ok: true,
      message:
        action === "pause"
          ? "تم إيقاف العنصر مؤقتاً"
          : action === "activate"
            ? "تم تفعيل العنصر"
            : "تم حذف العنصر",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}

function sanitizeListingInput(input: CreateListingInput): CreateListingInput {
  return {
    ...input,
    title: sanitizeText(input.title),
    description: sanitizeText(input.description),
    priceLabel: sanitizeText(input.priceLabel ?? ""),
    deliveryTime: sanitizeText(input.deliveryTime ?? ""),
    images: input.images.map(sanitizeUrl).filter(Boolean),
    tags: input.tags.map(sanitizeText).filter(Boolean),
  };
}

function sanitizeListingUpdateInput(input: UpdateListingInput): UpdateListingInput {
  return {
    ...input,
    title: sanitizeText(input.title),
    description: sanitizeText(input.description),
    priceLabel: sanitizeText(input.priceLabel ?? ""),
    deliveryTime: sanitizeText(input.deliveryTime ?? ""),
    images: input.images.map(sanitizeUrl).filter(Boolean),
    tags: input.tags.map(sanitizeText).filter(Boolean),
  };
}

function revalidateStorePaths(listingId?: string) {
  revalidateTag("store", "max");
  revalidatePath("/store");
  revalidatePath("/dashboard/store");

  if (listingId) {
    revalidatePath(`/store/${listingId}`);
    revalidatePath(`/dashboard/store/${listingId}/edit`);
  }
}
