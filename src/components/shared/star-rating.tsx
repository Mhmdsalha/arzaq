import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function StarRating({
  value,
  showValue = false,
  size = "sm",
}: {
  value: number;
  showValue?: boolean;
  size?: "sm" | "md";
}) {
  const rounded = Math.round(value);

  return (
    <div className="flex items-center gap-1" aria-label={`تقييم ${value} من 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            size === "md" ? "size-5" : "size-4",
            index < rounded ? "fill-amber-400 text-amber-400" : "text-slate-300",
          )}
        />
      ))}
      {showValue ? (
        <span className="mr-1 text-sm font-semibold text-slate-700">{value.toFixed(1)}</span>
      ) : null}
    </div>
  );
}
