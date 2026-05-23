"use client";

import NextNProgress from "nextjs-progressbar";

export function RouteProgressBar() {
  return (
    <NextNProgress
      color="#16a34a"
      height={3}
      options={{ showSpinner: false }}
      showOnShallow
      stopDelayMs={120}
    />
  );
}
