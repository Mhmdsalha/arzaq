import type { DeliveryMethod, ListingType, Region } from "@prisma/client";

import { deliveryMethodLabels, storeSortLabels, type StoreSort } from "@/constants/store";
import { regionLabels } from "@/constants/regions";
import { cn } from "@/lib/utils";
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
  className,
}: {
  categories: ListingCategoryOption[];
  values: StoreFilterValues;
  className?: string;
}) {
  return (
    <form action="/store" className={cn("rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:p-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-slate-950">الفلاتر</h2>
        <a href="/store" className="rounded-xl px-3 py-2 text-sm font-semibold text-primary-dark">
          مسح الكل
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

        <fieldset className="space-y-2 border-t border-slate-100 pt-4">
          <legend className="text-xs font-bold uppercase tracking-wide text-slate-500">نوع العنصر</legend>
          <RadioOption name="type" value="all" defaultChecked={values.type === "all"} label="الكل" />
          <RadioOption name="type" value="SERVICE" defaultChecked={values.type === "SERVICE"} label="خدمات جاهزة" />
          <RadioOption name="type" value="PHYSICAL" defaultChecked={values.type === "PHYSICAL"} label="منتجات" />
        </fieldset>

        <section className="border-t border-slate-100 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">التصنيف</h3>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible">
            <ChipRadio name="category" value="all" defaultChecked={values.category === "all"} label="كل التصنيفات" />
            {categories.map((category) => (
              <ChipRadio
                key={category.id}
                name="category"
                value={category.id}
                defaultChecked={values.category === category.id}
                label={category.name}
              />
            ))}
          </div>
        </section>

        <fieldset className="space-y-2 border-t border-slate-100 pt-4">
          <legend className="text-xs font-bold uppercase tracking-wide text-slate-500">المنطقة</legend>
          <RadioOption name="region" value="all" defaultChecked={values.region === "all"} label="كل المناطق" />
          {Object.entries(regionLabels).map(([value, label]) => (
            <RadioOption key={value} name="region" value={value} defaultChecked={values.region === value} label={label} />
          ))}
        </fieldset>

        <section className="border-t border-slate-100 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">طريقة التسليم</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <ChipRadio name="delivery" value="all" defaultChecked={values.delivery === "all"} label="كل الطرق" />
            {Object.entries(deliveryMethodLabels).map(([value, label]) => (
              <ChipRadio key={value} name="delivery" value={value} defaultChecked={values.delivery === value} label={label} />
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 lg:grid-cols-1 xl:grid-cols-2">
          <label className="grid min-w-0 gap-2 text-sm font-medium text-slate-700">
            من سعر
            <input
              name="min"
              type="number"
              min="0"
              defaultValue={values.min}
              className="h-12 w-full min-w-0 rounded-xl border border-slate-200 px-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <label className="grid min-w-0 gap-2 text-sm font-medium text-slate-700">
            إلى سعر
            <input
              name="max"
              type="number"
              min="0"
              defaultValue={values.max}
              className="h-12 w-full min-w-0 rounded-xl border border-slate-200 px-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
        </div>

        <fieldset className="space-y-2 border-t border-slate-100 pt-4">
          <legend className="text-xs font-bold uppercase tracking-wide text-slate-500">الترتيب</legend>
          {Object.entries(storeSortLabels).map(([value, label]) => (
            <RadioOption key={value} name="sort" value={value} defaultChecked={values.sort === value} label={label} />
          ))}
        </fieldset>

        <button className="sticky bottom-0 min-h-11 rounded-xl bg-primary px-5 font-semibold text-white transition hover:bg-primary-dark">
          تطبيق الفلاتر
        </button>
      </div>
    </form>
  );
}

function RadioOption({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl px-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="size-4 accent-primary"
      />
      <span>{label}</span>
    </label>
  );
}

function ChipRadio({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label>
      <input type="radio" name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="inline-flex min-h-8 cursor-pointer whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 transition peer-checked:bg-primary peer-checked:text-white">
        {label}
      </span>
    </label>
  );
}
