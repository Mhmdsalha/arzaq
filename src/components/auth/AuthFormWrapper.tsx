"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Logo } from "@/components/layout/logo";

export function AuthFormWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mx-auto flex min-h-full w-full max-w-md flex-col justify-start px-6 pb-8 pt-5 sm:px-8 lg:justify-center lg:px-12 lg:py-8"
    >
      <div className="mb-8 hidden items-center justify-between gap-4 lg:flex">
        <Logo className="hidden lg:inline-flex" />
        <Link href="/" className="text-sm font-medium text-slate-400 transition hover:text-primary">
          العودة للرئيسية
        </Link>
      </div>
      {children}
      <Link
        href="/"
        className="mt-6 text-center text-sm font-medium text-slate-400 transition hover:text-primary lg:hidden"
      >
        العودة للرئيسية
      </Link>
    </motion.div>
  );
}
