"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type PaymentProofPreviewProps = {
  proofUrl: string;
};

export function PaymentProofPreview({ proofUrl }: PaymentProofPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex min-h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-bold text-slate-950"
      >
        معاينة إشعار الدفع
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
              <div>
                <p className="text-xs font-bold text-primary-light">إشعار الدفع</p>
                <h2 className="mt-1 text-lg font-bold text-white">مراجعة صورة التحويل</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-white"
                aria-label="إغلاق"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="max-h-[75svh] overflow-auto bg-black/30 p-3">
              <Image
                src={proofUrl}
                alt="إشعار الدفع"
                width={1200}
                height={800}
                className="mx-auto max-h-[70svh] w-auto max-w-full rounded-2xl object-contain"
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 p-4">
              <a
                href={proofUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/10 px-4 text-sm font-semibold text-slate-200"
              >
                فتح في تبويب جديد
              </a>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-white"
              >
                تم
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
