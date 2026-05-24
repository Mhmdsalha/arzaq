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
      className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-8 sm:px-8 lg:px-12"
    >
      <div className="mb-8 flex items-center justify-between gap-4">
        <Logo />
        <Link href="/" className="text-sm font-medium text-slate-400 transition hover:text-primary">
          العودة للرئيسية
        </Link>
      </div>
      {children}
    </motion.div>
  );
}
