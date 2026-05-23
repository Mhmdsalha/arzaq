"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

function formatBadge(count: number) {
  if (count <= 0) return "";
  return count > 9 ? "٩+" : count.toLocaleString("ar");
}

export function NotificationBell({
  count,
  isTransparent = false,
}: {
  count: number;
  isTransparent?: boolean;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/dashboard/notifications")}
      className={cn(
        "relative inline-flex size-10 items-center justify-center rounded-xl transition",
        isTransparent
          ? "text-white hover:bg-white/10"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
      )}
      aria-label="الإشعارات"
    >
      <Bell className="size-5" />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-[18px] text-white">
          {formatBadge(count)}
        </span>
      ) : null}
    </button>
  );
}
