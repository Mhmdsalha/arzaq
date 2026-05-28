"use client";

import { CheckCircle2, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

type Rule = {
  label: string;
  test: (password: string) => boolean;
};

const rules: Rule[] = [
  { label: "٨ أحرف على الأقل", test: (password) => password.length >= 8 },
  { label: "يحتوي على حرف", test: (password) => /[A-Za-z\u0600-\u06FF]/.test(password) },
  { label: "يحتوي على رقم", test: (password) => /\d/.test(password) },
  { label: "رمز خاص يزيد القوة", test: (password) => /[^A-Za-z0-9\u0600-\u06FF]/.test(password) },
];

export function PasswordStrengthMeter({ password }: { password: string }) {
  const score = rules.filter((rule) => rule.test(password)).length;
  const label = getStrengthLabel(score);

  return (
    <div className="space-y-2 text-right" dir="rtl">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">قوة كلمة المرور</span>
        <span className={cn("font-semibold", getStrengthColor(score))}>{label}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full transition-all duration-300", getStrengthBg(score))}
          style={{ width: `${Math.max(score, 1) * 25}%` }}
        />
      </div>
      <div className="grid gap-1 text-xs text-slate-500">
        {rules.map((rule) => {
          const passed = rule.test(password);
          const Icon = passed ? CheckCircle2 : Circle;

          return (
            <div key={rule.label} className="flex items-center gap-2">
              <Icon className={cn("h-3.5 w-3.5", passed ? "text-primary" : "text-slate-300")} />
              <span>{rule.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getStrengthLabel(score: number) {
  if (score <= 1) return "ضعيفة";
  if (score === 2) return "متوسطة";
  if (score === 3) return "قوية";
  return "ممتازة";
}

function getStrengthColor(score: number) {
  if (score <= 1) return "text-red-500";
  if (score === 2) return "text-amber-600";
  return "text-primary";
}

function getStrengthBg(score: number) {
  if (score <= 1) return "bg-red-400";
  if (score === 2) return "bg-amber-500";
  return "bg-primary";
}
