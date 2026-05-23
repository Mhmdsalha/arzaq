"use client";

import { useEffect, useState } from "react";

type NavigationSummaryResponse = {
  user: {
    id: string;
    name: string;
    email: string | null;
    role: "USER" | "ADMIN";
    accountType: "CLIENT" | "PROVIDER";
  };
  unreadCount: number;
  avatarUrl: string | null;
  profileCompletion: number;
  stats: {
    postedJobs: number;
    receivedOffers: number;
    sentOffers: number;
    acceptedOffers: number;
  };
};

export function useUnreadCount(enabled = true, accountType?: "CLIENT" | "PROVIDER") {
  const [summary, setSummary] = useState<NavigationSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isMounted = true;

    async function fetchSummary() {
      if (document.visibilityState === "hidden") {
        return;
      }

      try {
        const response = await fetch("/api/navigation/summary", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as NavigationSummaryResponse;

        if (isMounted) {
          setSummary(data);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void fetchSummary();
      }
    }

    void fetchSummary();
    const intervalId = setInterval(fetchSummary, 60_000);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;

      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, accountType]);

  const syncedSummary = accountType && summary?.user.accountType !== accountType ? null : summary;

  return {
    unreadCount: enabled ? (syncedSummary?.unreadCount ?? 0) : 0,
    summary: enabled ? syncedSummary : null,
    isLoading: enabled ? isLoading : false,
  };
}
