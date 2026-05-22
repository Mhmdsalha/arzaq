import type { WorkMode } from "@prisma/client";
import { Check } from "lucide-react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const workModeLabels: Record<WorkMode, string> = {
  ONLINE: "أونلاين",
  FIELD: "ميداني",
  BOTH: "كلاهما",
};

export function WorkModeSelector({
  value,
  error,
  onChange,
}: {
  value: WorkMode;
  error?: string;
  onChange: (value: WorkMode) => void;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend>
        <Label asChild>
          <span>طريقة العمل</span>
        </Label>
      </legend>
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(workModeLabels).map(([mode, label]) => {
          const isSelected = value === mode;

          return (
            <button
              key={mode}
              type="button"
              onClick={() => onChange(mode as WorkMode)}
              className={cn(
                "flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium transition-all",
                isSelected
                  ? "border-primary bg-primary/10 text-primary-dark"
                  : "border-slate-200 bg-white text-slate-700 hover:border-primary/50",
              )}
            >
              {isSelected ? <Check className="size-4" /> : null}
              {label}
            </button>
          );
        })}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </fieldset>
  );
}
