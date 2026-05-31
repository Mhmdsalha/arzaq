"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Pagination({
  currentPage = 1,
  totalPages = 4,
  onPageChange,
}: {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    onPageChange?.(page);
  };

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="ترقيم الصفحات">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
      >
        <ChevronRight className="size-4" />
        السابق
      </Button>
      {Array.from({ length: totalPages }).map((_, index) => {
        const page = index + 1;
        return (
          <Button
            key={page}
            type="button"
            variant={page === currentPage ? "default" : "secondary"}
            size="sm"
            onClick={() => goToPage(page)}
          >
            {page}
          </Button>
        );
      })}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => goToPage(currentPage + 1)}
      >
        التالي
        <ChevronLeft className="size-4" />
      </Button>
    </nav>
  );
}
