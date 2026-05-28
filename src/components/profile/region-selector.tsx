import type { Region } from "@prisma/client";

import { Label } from "@/components/ui/label";
import { regionLabels } from "@/constants/regions";

export function RegionSelector({
  value,
  error,
  onChange,
}: {
  value: Region;
  error?: string;
  onChange: (value: Region) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="region">المنطقة</Label>
      <select
        id="region"
        value={value}
        onChange={(event) => onChange(event.target.value as Region)}
        className="h-12 rounded-xl border border-slate-200 bg-white px-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-invalid={Boolean(error)}
      >
        {Object.entries(regionLabels).map(([region, label]) => (
          <option key={region} value={region}>
            {label}
          </option>
        ))}
      </select>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
