import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center text-3xl font-bold text-primary-dark", className)}
    >
      <span className="font-palestine leading-none">أرزاق</span>
    </Link>
  );
}
