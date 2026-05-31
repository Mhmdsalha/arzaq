"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  latestUnreadNotification: {
    id: string;
    message: string;
    link: string | null;
    createdAt: string;
  } | null;
  stats: {
    postedJobs: number;
    receivedOffers: number;
    sentOffers: number;
    acceptedOffers: number;
  };
};

const SUMMARY_TTL_MS = 8_000;
const SUMMARY_POLL_MS = 60_000;
const SUMMARY_REFRESH_EVENT = "arzaq:navigation-summary-refresh";

let cachedSummary: NavigationSummaryResponse | null = null;
let cachedAt = 0;
let pendingSummary: Promise<NavigationSummaryResponse | null> | null = null;
let lastNotifiedUnreadId: string | null = null;

export function useUnreadCount(enabled = true, accountType?: "CLIENT" | "PROVIDER") {
  const [summary, setSummary] = useState<NavigationSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isMounted = true;
    let eventSource: EventSource | null = null;
    let hasReceivedInitialRealtimeSummary = false;

    async function fetchSummary(force = false) {
      if (document.visibilityState === "hidden") {
        return;
      }

      try {
        const data = await getNavigationSummary({ force });

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
        void fetchSummary(true);
      }
    }

    function handleFocus() {
      void fetchSummary(true);
    }

    function handleManualRefresh() {
      void fetchSummary(true);
    }

    void fetchSummary();
    if ("EventSource" in window) {
      eventSource = new EventSource("/api/navigation/stream");
      eventSource.addEventListener("summary", (event) => {
        if (!isMounted) {
          return;
        }

        const data = JSON.parse((event as MessageEvent).data) as NavigationSummaryResponse;
        cachedSummary = data;
        cachedAt = Date.now();
        if (hasReceivedInitialRealtimeSummary) {
          notifyForRealtimeUnread(data);
        } else {
          lastNotifiedUnreadId = data.latestUnreadNotification?.id ?? null;
          hasReceivedInitialRealtimeSummary = true;
        }
        setSummary(data);
        setIsLoading(false);
      });
    }

    const intervalId = setInterval(fetchSummary, SUMMARY_POLL_MS);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener(SUMMARY_REFRESH_EVENT, handleManualRefresh);

    return () => {
      isMounted = false;

      clearInterval(intervalId);
      eventSource?.close();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener(SUMMARY_REFRESH_EVENT, handleManualRefresh);
    };
  }, [enabled, accountType]);

  const syncedSummary = accountType && summary?.user.accountType !== accountType ? null : summary;

  return {
    unreadCount: enabled ? (syncedSummary?.unreadCount ?? 0) : 0,
    summary: enabled ? syncedSummary : null,
    isLoading: enabled ? isLoading : false,
  };
}

function notifyForRealtimeUnread(data: NavigationSummaryResponse) {
  const notification = data.latestUnreadNotification;

  if (!notification || notification.id === lastNotifiedUnreadId) {
    return;
  }

  lastNotifiedUnreadId = notification.id;

  toast.info(notification.message, {
    action: notification.link
      ? {
          label: "فتح",
          onClick: () => {
            window.location.href = notification.link ?? "/dashboard/notifications";
          },
        }
      : undefined,
  });
}

export function refreshNavigationSummary() {
  cachedSummary = null;
  cachedAt = 0;
  window.dispatchEvent(new Event(SUMMARY_REFRESH_EVENT));
}

async function getNavigationSummary({ force = false }: { force?: boolean } = {}) {
  const now = Date.now();

  if (!force && cachedSummary && now - cachedAt < SUMMARY_TTL_MS) {
    return cachedSummary;
  }

  if (!pendingSummary) {
    pendingSummary = fetch("/api/navigation/summary", {
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        const data = (await response.json()) as NavigationSummaryResponse;
        cachedSummary = data;
        cachedAt = Date.now();
        return data;
      })
      .finally(() => {
        pendingSummary = null;
      });
  }

  return pendingSummary;
}
