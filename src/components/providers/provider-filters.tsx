"use client";

import type { Category } from "@/types/marketplace";

export type ProviderFilterState = {
  region: string;
  category: string;
  trustedOnly: boolean;
};

export function ProviderFilters({
  categories,
  regions,
  value,
  onChange,
}: {
  categories: Category[];
  regions: Array<{ value: string; label: string }>;
  value: ProviderFilterState;
  onChange: (value: ProviderFilterState) => void;
}) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-950">فلترة مقدمي الخدمات</h2>
        <button
          type="button"
          className="min-h-11 rounded-xl px-3 text-sm font-medium text-primary-dark"
          onClick={() => onChange({ region: "all", category: "all", trustedOnly: true })}
        >
          مسح
        </button>
      </div>
      <div className="mt-5 space-y-5">
        <FilterSelect
          label="المنطقة"
          value={value.region}
          onChange={(region) => onChange({ ...value, region })}
          options={[{ value: "all", label: "كل المناطق" }, ...regions]}
        />
        <FilterSelect
          label="المجال"
          value={value.category}
          onChange={(category) => onChange({ ...value, category })}
          options={[
            { value: "all", label: "كل المجالات" },
            ...categories.map((category) => ({ value: category.slug, label: category.name })),
          ]}
        />
        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
          <input
            type="checkbox"
            checked={value.trustedOnly}
            onChange={(event) => onChange({ ...value, trustedOnly: event.target.checked })}
            className="size-5 rounded border-emerald-300 text-primary focus:ring-primary"
          />
          الموثقون فقط
        </label>
      </div>
    </aside>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-xl border-slate-200 bg-white text-base focus:border-primary focus:ring-primary"
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
