"use client";

import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";

export function LogoutConfirmDialog({
  open,
  isPending = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] grid min-h-dvh place-items-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-confirm-title"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-right shadow-2xl">
        <h3 id="logout-confirm-title" className="text-lg font-bold text-slate-950">
          تسجيل الخروج
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">هل أنت متأكد أنك تريد تسجيل الخروج؟</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
            إلغاء
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? "جاري الخروج..." : "تسجيل الخروج"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
