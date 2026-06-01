import { Skeleton } from "@/components/shared/Skeleton";

export default function ListingDetailsLoading() {
  return (
    <main className="container-responsive pb-16 pt-28">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Skeleton className="aspect-video rounded-3xl" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    </main>
  );
}
