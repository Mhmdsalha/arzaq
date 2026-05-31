import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ className, textClassName }: { className?: string; textClassName?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex h-20 items-center overflow-visible text-primary-dark lg:h-14",
        className,
      )}
    >
      <span
        className={cn(
          "block translate-y-0 pt-1 font-palestine text-[40px] font-bold leading-none sm:translate-y-1.5 sm:pt-[20px] sm:text-[2.8rem] lg:-translate-y-1 lg:pt-1 lg:text-[2.35rem] lg:leading-[1.25]",
          textClassName,
        )}
      >
        أرزاق
      </span>
    </Link>
  );
}
