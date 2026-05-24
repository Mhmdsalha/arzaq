"use client";

import { cn } from "@/lib/utils";

export function StepIndicator({ currentStep }: { currentStep: 1 | 2 }) {
  const steps = [
    { step: 1, label: "اختيار نوع الحساب" },
    { step: 2, label: "بيانات التسجيل" },
  ] as const;

  return (
    <div className="mb-6 flex items-center justify-center gap-3 text-xs text-slate-500">
      {steps.map((item, index) => (
        <div key={item.step} className="flex items-center gap-2">
          <span
            className={cn(
              "h-2.5 rounded-full transition-all duration-300",
              currentStep === item.step ? "w-7 bg-primary" : "w-2.5 bg-slate-300",
            )}
          />
          <span className={cn(currentStep === item.step && "font-semibold text-primary-dark")}>
            {item.label}
          </span>
          {index === 0 ? <span className="h-px w-6 bg-slate-200" /> : null}
        </div>
      ))}
    </div>
  );
}
