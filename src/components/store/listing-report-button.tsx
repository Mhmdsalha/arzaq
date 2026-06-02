"use client";

import { Flag, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { createListingReportAction } from "@/actions/listing-report.actions";
import { Button } from "@/components/ui/button";

const reportReasons = [
  "محتوى غير مناسب",
  "احتيال أو تضليل",
  "معلومات غير صحيحة",
  "سعر أو وصف مضلل",
  "سبب آخر",
];

export function ListingReportButton({
  listingId,
  className,
}: {
  listingId: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState(reportReasons[0]);
  const [details, setDetails] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitReport() {
    const finalReason = reason === "سبب آخر" ? details : reason;

    startTransition(async () => {
      const result = await createListingReportAction({
        listingId,
        reason: finalReason,
        details: reason === "سبب آخر" ? "" : details,
      });

      if (result.ok) {
        toast.success(result.message);
        setIsOpen(false);
        setDetails("");
        return;
      }

      toast.error(result.message);
    });
  }

  return (
    <>
      <Button type="button" variant="secondary" className={className} onClick={() => setIsOpen(true)}>
        <Flag className="size-4" />
        الإبلاغ عن هذا العنصر
      </Button>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] grid min-h-[100svh] place-items-center bg-slate-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl bg-white p-6 text-right shadow-2xl"
          >
            <h2 className="text-lg font-bold text-slate-950">إرسال بلاغ</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              ساعدنا في الحفاظ على متجر أرزاق مساحة آمنة ومنظمة.
            </p>

            <div className="mt-4 grid gap-2">
              {reportReasons.map((item) => (
                <label
                  key={item}
                  className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm text-slate-700"
                >
                  <input
                    type="radio"
                    name={`listing-report-${listingId}`}
                    checked={reason === item}
                    onChange={() => setReason(item)}
                    className="size-4"
                  />
                  {item}
                </label>
              ))}
            </div>

            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              className="mt-3 min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-right text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder={reason === "سبب آخر" ? "اكتب سبب البلاغ..." : "تفاصيل إضافية اختيارية..."}
              maxLength={500}
            />

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={isPending}>
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={submitReport}
                disabled={isPending || (reason === "سبب آخر" && details.trim().length < 5)}
              >
                {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {isPending ? "جاري الإرسال..." : "إرسال البلاغ"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
