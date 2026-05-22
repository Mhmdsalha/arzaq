"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function PublicError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState message="تعذر تحميل الصفحة العامة." onRetry={reset} />;
}
