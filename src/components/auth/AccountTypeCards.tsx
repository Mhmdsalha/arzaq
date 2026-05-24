"use client";

import type { AccountType } from "@prisma/client";
import { Briefcase, Check, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";

const accountTypes = [
  {
    value: "CLIENT",
    icon: Briefcase,
    title: "صاحب طلب",
    description: "أنشر طلبات واحصل على عروض",
    perks: ["نشر طلبات العمل", "تلقّي العروض", "تقييم مقدمي الخدمات"],
  },
  {
    value: "PROVIDER",
    icon: Wrench,
    title: "مقدم خدمة",
    description: "اعرض مهاراتك وقدّم عروضك",
    perks: ["بروفايل مهني", "التقديم على الطلبات", "بناء سمعة موثوقة"],
  },
] satisfies Array<{
  value: AccountType;
  icon: React.ElementType;
  title: string;
  description: string;
  perks: string[];
}>;

export function AccountTypeCards({
  selected,
  onSelect,
}: {
  selected: AccountType | null;
  onSelect: (value: AccountType) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {accountTypes.map((type) => {
        const Icon = type.icon;
        const isSelected = selected === type.value;

        return (
          <button
            key={type.value}
            type="button"
            className={cn(
              "rounded-2xl border border-slate-200 bg-white p-5 text-right shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
              isSelected && "scale-[1.02] border-2 border-primary bg-green-50 shadow-md",
            )}
            onClick={() => onSelect(type.value)}
          >
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-green-100 text-primary-dark">
              <Icon className="size-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-950">{type.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{type.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {type.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2">
                  <Check className="size-4 text-primary" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
