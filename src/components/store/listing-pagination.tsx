import Link from "next/link";

export function ListingPagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: URLSearchParams;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="صفحات المتجر">
      {Array.from({ length: totalPages }).map((_, index) => {
        const nextPage = index + 1;
        const params = new URLSearchParams(searchParams);
        params.set("page", String(nextPage));
        const isActive = nextPage === page;

        return (
          <Link
            key={nextPage}
            href={`/store?${params.toString()}`}
            className={
              isActive
                ? "flex size-10 items-center justify-center rounded-xl bg-primary font-bold text-white"
                : "flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50"
            }
          >
            {nextPage}
          </Link>
        );
      })}
    </nav>
  );
}
