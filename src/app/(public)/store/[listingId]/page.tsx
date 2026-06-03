import { notFound } from "next/navigation";

import { ListingDetails } from "@/components/store/listing-details";
import { auth } from "@/lib/auth";
import { createPageMetadata } from "@/lib/seo";
import {
  getListingById,
  getSimilarListings,
  incrementListingViews,
} from "@/services/listing.service";

export const revalidate = 60;

export const metadata = createPageMetadata({
  title: "تفاصيل المنتج",
  description: "تفاصيل خدمة أو منتج داخل متجر أرزاق.",
  path: "/store",
});

export default async function ListingDetailsPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  const listing = await getListingById(listingId, userId);

  if (!listing) {
    notFound();
  }

  const [similarListings] = await Promise.all([
    getSimilarListings(listing.category.id, listing.id, userId),
    incrementListingViews(listing.id, userId),
  ]);

  return (
    <main className="container-responsive pb-28 pt-28 lg:pb-16">
      <ListingDetails
        listing={listing}
        similarListings={similarListings}
        isAuthenticated={Boolean(userId)}
      />
    </main>
  );
}
