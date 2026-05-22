"use client";

import type { Category } from "@/types/marketplace";

export type JobFilterState = {
  region: string;
  category: string;
  workMode: string;
  urgentOnly: boolean;
};

export function JobFilters({
  categories,
  regions,
  value,
  onChange,
}: {
  categories: Category[];
  regions: Array<{ value: string; label: string }>;
  value: JobFilterState;
  onChange: (value: JobFilterState) => void;
}) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-950">الفلاتر</h2>
        <button
          type="button"
          className="text-sm font-medium text-primary-dark"
          onClick={() =>
            onChange({ region: "all", category: "all", workMode: "all", urgentOnly: false })
          }
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
          label="التصنيف"
          value={value.category}
          onChange={(category) => onChange({ ...value, category })}
          options={[
            { value: "all", label: "كل التصنيفات" },
            ...categories.map((category) => ({
              value: category.slug,
              label: category.name,
            })),
          ]}
        />
        <FilterSelect
          label="نمط العمل"
          value={value.workMode}
          onChange={(workMode) => onChange({ ...value, workMode })}
          options={[
            { value: "all", label: "كل الأنماط" },
            { value: "ONLINE", label: "أونلاين" },
            { value: "FIELD", label: "ميداني" },
            { value: "BOTH", label: "مرن" },
          ]}
        />
        <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-800">
          <input
            type="checkbox"
            checked={value.urgentOnly}
            onChange={(event) => onChange({ ...value, urgentOnly: event.target.checked })}
            className="rounded border-amber-300 text-primary focus:ring-primary"
          />
          الطلبات العاجلة فقط
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
        className="h-11 rounded-xl border-slate-200 bg-white text-sm focus:border-primary focus:ring-primary"
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
