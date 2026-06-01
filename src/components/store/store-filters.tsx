import type { DeliveryMethod, ListingType, Region } from "@prisma/client";

import { deliveryMethodLabels, storeSortLabels, type StoreSort } from "@/constants/store";
import { regionLabels } from "@/constants/regions";
import type { ListingCategoryOption } from "@/types/store";

export type StoreFilterValues = {
  q: string;
  type: ListingType | "all";
  category: string;
  region: Region | "all";
  delivery: DeliveryMethod | "all";
  min: string;
  max: string;
  sort: StoreSort;
};

export function StoreFilters({
  categories,
  values,
}: {
  categories: ListingCategoryOption[];
  values: StoreFilterValues;
}) {
  return (
    <form className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-slate-950">فلاتر المتجر</h2>
        <a href="/store" className="rounded-xl px-3 py-2 text-sm font-semibold text-primary-dark">
          مسح
        </a>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          البحث
          <input
            name="q"
            defaultValue={values.q}
            placeholder="ابحث عن خدمة أو منتج..."
            className="h-12 rounded-xl border border-slate-200 px-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </label>

        <FilterSelect
          label="النوع"
          name="type"
          defaultValue={values.type}
          options={[
            { value: "all", label: "الكل" },
            { value: "SERVICE", label: "خدمات جاهزة" },
            { value: "PHYSICAL", label: "منتجات" },
          ]}
        />

        <FilterSelect
          label="التصنيف"
          name="category"
          defaultValue={values.category}
          options={[
            { value: "all", label: "كل التصنيفات" },
            ...categories.map((category) => ({ value: category.id, label: category.name })),
          ]}
        />

        <FilterSelect
          label="المنطقة"
          name="region"
          defaultValue={values.region}
          options={[
            { value: "all", label: "كل المناطق" },
            ...Object.entries(regionLabels).map(([value, label]) => ({ value, label })),
          ]}
        />

        <FilterSelect
          label="طريقة التسليم"
          name="delivery"
          defaultValue={values.delivery}
          options={[
            { value: "all", label: "كل الطرق" },
            ...Object.entries(deliveryMethodLabels).map(([value, label]) => ({ value, label })),
          ]}
        />

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            من سعر
            <input
              name="min"
              type="number"
              min="0"
              defaultValue={values.min}
              className="h-12 rounded-xl border border-slate-200 px-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            إلى سعر
            <input
              name="max"
              type="number"
              min="0"
              defaultValue={values.max}
              className="h-12 rounded-xl border border-slate-200 px-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
        </div>

        <FilterSelect
          label="الترتيب"
          name="sort"
          defaultValue={values.sort}
          options={Object.entries(storeSortLabels).map(([value, label]) => ({ value, label }))}
        />

        <button className="min-h-11 rounded-xl bg-primary px-5 font-semibold text-white transition hover:bg-primary-dark">
          تطبيق الفلاتر
        </button>
      </div>
    </form>
  );
}

function FilterSelect({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="h-12 rounded-xl border border-slate-200 bg-white px-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
