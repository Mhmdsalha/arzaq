"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordField({
  id,
  label,
  error,
  autoComplete,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={isVisible ? "text" : "password"}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          className="h-12 rounded-xl border-slate-200 px-4 pl-11 text-right text-base focus:border-primary focus-visible:ring-primary/20"
          {...props}
        />
        <button
          type="button"
          className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
          onClick={() => setIsVisible((value) => !value)}
          aria-label={isVisible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        >
          {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
