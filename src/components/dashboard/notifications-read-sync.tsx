"use client";

import { useEffect } from "react";

import { refreshNavigationSummary } from "@/hooks/useUnreadCount";

export function NotificationsReadSync() {
  useEffect(() => {
    refreshNavigationSummary();
  }, []);

  return null;
}
