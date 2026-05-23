import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 text-xl font-bold text-primary-dark",
        className,
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary font-palestine text-white shadow-sm">
        أ
      </span>
      <span className="font-palestine">أرزاق</span>
    </Link>
  );
}
