"use client";

import type { DeliveryMethod, ListingType } from "@prisma/client";
import { Minus, Plus, X } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { createOrderAction } from "@/actions/order.actions";
import { Button } from "@/components/ui/button";
import { deliveryMethodLabels, listingTypeLabels } from "@/constants/store";

type OrderSheetListing = {
  id: string;
  title: string;
  type: ListingType;
  price: number;
  quantity: number | null;
  deliveryMethod: DeliveryMethod;
};

export function OrderSheet({ listing }: { listing: OrderSheetListing }) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [address, setAddress] = useState("");
  const [contactMethod, setContactMethod] = useState<"WHATSAPP" | "PLATFORM">("PLATFORM");
  const [isPending, startTransition] = useTransition();
  const isService = listing.type === "SERVICE";
  const maxQuantity = listing.quantity ?? 99;
  const total = useMemo(() => listing.price * quantity, [listing.price, quantity]);

  function submitOrder() {
    startTransition(async () => {
      const result = await createOrderAction({
        listingId: listing.id,
        quantity,
        note,
        address,
        contactMethod,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setIsOpen(false);
      setNote("");
      setAddress("");
      setQuantity(1);

      if (result.whatsappUrl) {
        window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      }
    });
  }

  return (
    <>
      <Button type="button" className="w-full" onClick={() => setIsOpen(true)}>
        اطلب عبر المنصة
      </Button>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-end bg-slate-950/50 p-0 sm:items-center sm:justify-center sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[90svh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 text-right shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-6"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-primary-dark">
                  {listingTypeLabels[listing.type]} · {deliveryMethodLabels[listing.deliveryMethod]}
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">إرسال طلب</h2>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                  {listing.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600"
                aria-label="إغلاق"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {!isService ? (
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="mb-3 text-sm font-bold text-slate-800">الكمية</p>
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => Math.max(value - 1, 1))}
                      className="flex size-11 items-center justify-center rounded-xl border border-slate-200"
                      aria-label="تقليل الكمية"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="text-2xl font-bold text-slate-950">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => Math.min(value + 1, maxQuantity))}
                      className="flex size-11 items-center justify-center rounded-xl border border-slate-200"
                      aria-label="زيادة الكمية"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  {listing.quantity !== null ? (
                    <p className="mt-2 text-xs text-slate-500">المتاح: {listing.quantity}</p>
                  ) : null}
                </div>
              ) : null}

              <label className="grid gap-2 text-sm font-bold text-slate-800">
                {isService ? "وصف طلبك" : "ملاحظة للبائع"}
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={
                    isService
                      ? "اشرح ما تحتاجه بالتحديد..."
                      : "اكتب أي ملاحظة مهمة للبائع..."
                  }
                  className="min-h-28 resize-y rounded-xl border border-slate-200 px-4 py-3 text-right text-base font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  maxLength={1000}
                />
              </label>

              {listing.deliveryMethod === "DELIVERY" ? (
                <label className="grid gap-2 text-sm font-bold text-slate-800">
                  عنوان التوصيل
                  <textarea
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="اكتب العنوان أو المنطقة الأقرب..."
                    className="min-h-20 resize-y rounded-xl border border-slate-200 px-4 py-3 text-right text-base font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    maxLength={300}
                  />
                </label>
              ) : null}

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="mb-3 text-sm font-bold text-slate-800">طريقة التواصل المفضلة</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <ContactMethodOption
                    value="PLATFORM"
                    checked={contactMethod === "PLATFORM"}
                    onChange={setContactMethod}
                    label="داخل المنصة"
                  />
                  <ContactMethodOption
                    value="WHATSAPP"
                    checked={contactMethod === "WHATSAPP"}
                    onChange={setContactMethod}
                    label="واتساب"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>السعر</span>
                  <span>{formatPrice(listing.price)} × {quantity}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 font-bold text-slate-950">
                  <span>الإجمالي</span>
                  <span className="text-primary-dark">{formatPrice(total)}</span>
                </div>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  الدفع خارج المنصة، نقداً أو حسب الاتفاق مع البائع.
                </p>
              </div>

              <Button type="button" className="w-full" onClick={submitOrder} disabled={isPending}>
                {isPending ? "جاري الإرسال..." : "إرسال الطلب"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ContactMethodOption({
  value,
  checked,
  onChange,
  label,
}: {
  value: "WHATSAPP" | "PLATFORM";
  checked: boolean;
  onChange: (value: "WHATSAPP" | "PLATFORM") => void;
  label: string;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700">
      <input
        type="radio"
        name="contactMethod"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="size-4"
      />
      {label}
    </label>
  );
}

function formatPrice(price: number) {
  return (
    new Intl.NumberFormat("ar", {
      maximumFractionDigits: 0,
    }).format(price) + " شيكل"
  );
}
