"use client";

import { Button } from "@/components/ui/button";

export function ErrorState({
  message = "حدث خطأ، حاول مرة أخرى",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-background px-4 text-center">
      <div className="max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">عذرًا</h2>
        <p className="text-sm leading-6 text-slate-600">{message}</p>
        {onRetry ? <Button onClick={onRetry}>إعادة المحاولة</Button> : null}
      </div>
    </div>
  );
}
