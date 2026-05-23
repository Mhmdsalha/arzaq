"use client";

import type { AccountType } from "@prisma/client";
import { BriefcaseBusiness, Check, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const options = [
  {
    value: "CLIENT" as const,
    icon: BriefcaseBusiness,
    title: "صاحب طلب",
    description: "أنشر طلبات العمل والخدمات واحصل على عروض من مقدمي الخدمات",
    examples: ["نشر طلبات العمل", "تلقّي العروض واختيار الأنسب", "تقييم مقدمي الخدمات"],
  },
  {
    value: "PROVIDER" as const,
    icon: Star,
    title: "مقدم خدمة",
    description: "اعرض مهاراتك وقدّم عروضك على الطلبات المنشورة واكسب دخلاً",
    examples: ["بناء بروفايل مهني", "التقديم على الطلبات", "تلقّي التقييمات وبناء السمعة"],
  },
];

export function AccountTypeSelector({
  selected,
  onSelect,
  onContinue,
}: {
  selected: AccountType | null;
  onSelect: (accountType: AccountType) => void;
  onContinue: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 text-center">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-950 md:text-4xl">كيف تريد استخدام أرزاق؟</h1>
        <p className="text-sm leading-7 text-slate-600">
          اختر نوع حسابك، يمكنك تغييره لاحقاً من الإعدادات
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = selected === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={cn(
                "min-h-72 rounded-3xl border-2 bg-white p-6 text-right shadow-sm transition-all hover:-translate-y-1 hover:shadow-md",
                isSelected
                  ? "border-primary bg-primary/10 ring-4 ring-primary/10"
                  : "border-slate-200 hover:border-primary/40",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className={cn(
                    "grid size-14 place-items-center rounded-2xl",
                    isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-700",
                  )}
                >
                  <Icon className="size-7" />
                </span>
                {isSelected ? (
                  <span className="grid size-8 place-items-center rounded-full bg-primary text-white">
                    <Check className="size-4" />
                  </span>
                ) : null}
              </div>

              <h2 className="mt-5 text-2xl font-bold text-slate-950">{option.title}</h2>
              <p className="mt-3 min-h-14 text-sm leading-7 text-slate-600">{option.description}</p>

              <ul className="mt-5 space-y-3 text-sm font-medium text-slate-700">
                {option.examples.map((example) => (
                  <li key={example} className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <Button
        type="button"
        className="min-h-12 w-full md:w-64"
        disabled={!selected}
        onClick={onContinue}
      >
        متابعة
      </Button>
    </div>
  );
}
