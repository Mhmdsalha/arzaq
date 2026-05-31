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
          "block translate-y-1.5 pt-[20px] font-palestine text-[40px] font-bold leading-none sm:text-[2.8rem] lg:-translate-y-2 lg:pt-0 lg:text-[2.35rem] lg:leading-[1.25]",
          textClassName,
        )}
      >
        أرزاق
      </span>
    </Link>
  );
}
