"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

import { StoreFilters, type StoreFilterValues } from "@/components/store/store-filters";
import type { ListingCategoryOption } from "@/types/store";

export function StoreFilterSheet({
  categories,
  values,
}: {
  categories: ListingCategoryOption[];
  values: StoreFilterValues;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-200"
        aria-label="فتح فلاتر المتجر"
      >
        <SlidersHorizontal className="size-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40"
            aria-label="إغلاق الفلاتر"
            onClick={() => setOpen(false)}
          />
          <div className="ios-momentum absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl safe-bottom">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-950">فلاتر المتجر</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex size-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                aria-label="إغلاق"
              >
                <X className="size-5" />
              </button>
            </div>
            <StoreFilters categories={categories} values={values} className="border-0 p-0 shadow-none" />
          </div>
        </div>
      ) : null}
    </>
  );
}
