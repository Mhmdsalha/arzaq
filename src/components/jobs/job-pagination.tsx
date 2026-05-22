"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

export function JobPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefFor(page: number) {
    const params = new URLSearchParams(searchParams.toString());

    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }

    return `${pathname}?${params.toString()}`;
  }

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="ترقيم الصفحات">
      <Button asChild variant="secondary" size="sm" disabled={currentPage === 1}>
        <Link href={hrefFor(Math.max(currentPage - 1, 1))}>
          <ChevronRight className="size-4" />
          السابق
        </Link>
      </Button>
      {Array.from({ length: totalPages }).map((_, index) => {
        const page = index + 1;

        return (
          <Button
            key={page}
            asChild
            variant={page === currentPage ? "default" : "secondary"}
            size="sm"
          >
            <Link href={hrefFor(page)}>{page}</Link>
          </Button>
        );
      })}
      <Button asChild variant="secondary" size="sm" disabled={currentPage === totalPages}>
        <Link href={hrefFor(Math.min(currentPage + 1, totalPages))}>
          التالي
          <ChevronLeft className="size-4" />
        </Link>
      </Button>
    </nav>
  );
}
