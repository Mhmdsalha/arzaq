"use client";

import { Star } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function StarRating({
  value,
  showValue = false,
  size = "sm",
  onChange,
  disabled = false,
}: {
  value: number;
  showValue?: boolean;
  size?: "sm" | "md";
  onChange?: (value: number) => void;
  disabled?: boolean;
}) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const isInteractive = Boolean(onChange) && !disabled;
  const activeValue = hoveredValue ?? value;
  const rounded = Math.round(activeValue);

  return (
    <div
      className="flex items-center gap-1"
      role={isInteractive ? "radiogroup" : undefined}
      aria-label={`تقييم ${value} من 5`}
      onMouseLeave={() => setHoveredValue(null)}
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const isActive = index < rounded;

        if (!isInteractive) {
          return (
            <Star
              key={starValue}
              className={cn(
                size === "md" ? "size-5" : "size-4",
                isActive ? "fill-amber-400 text-amber-400" : "text-slate-300",
              )}
            />
          );
        }

        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={Math.round(value) === starValue}
            aria-label={`${starValue} من 5`}
            disabled={disabled}
            onClick={() => onChange?.(starValue)}
            onMouseEnter={() => setHoveredValue(starValue)}
            className="inline-flex size-9 items-center justify-center rounded-full text-slate-300 transition hover:scale-110 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Star
              className={cn(
                size === "md" ? "size-6" : "size-5",
                isActive ? "fill-amber-400 text-amber-400" : "text-slate-300",
              )}
            />
          </button>
        );
      })}
      {showValue ? (
        <span className="mr-1 text-sm font-semibold text-slate-700">{value.toFixed(1)}</span>
      ) : null}
    </div>
  );
}
