"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState message="تعذر تحميل لوحة المستخدم." onRetry={reset} />;
}
