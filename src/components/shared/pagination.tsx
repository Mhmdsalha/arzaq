import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Pagination({
  currentPage = 1,
  totalPages = 4,
}: {
  currentPage?: number;
  totalPages?: number;
}) {
  return (
    <nav className="flex items-center justify-center gap-2" aria-label="ترقيم الصفحات">
      <Button variant="secondary" size="sm" disabled={currentPage === 1}>
        <ChevronRight className="size-4" />
        السابق
      </Button>
      {Array.from({ length: totalPages }).map((_, index) => {
        const page = index + 1;
        return (
          <Button key={page} variant={page === currentPage ? "default" : "secondary"} size="sm">
            {page}
          </Button>
        );
      })}
      <Button variant="secondary" size="sm" disabled={currentPage === totalPages}>
        التالي
        <ChevronLeft className="size-4" />
      </Button>
    </nav>
  );
}
