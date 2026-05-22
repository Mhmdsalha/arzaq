"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState message="حدث خطأ في صفحة الدخول." onRetry={reset} />;
}
