"use client";

import type { StorePlan, StorePlanPaymentMethod } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useMemo, useState, useTransition } from "react";
import { Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

import { createStorePlanPaymentRequestAction } from "@/actions/store-plan.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { paymentMethodOrder, paymentMethods } from "@/constants/payment-methods";
import { formatStorePlanPrice, storePlans } from "@/constants/store-plans";
import { uploadPaymentProofImage } from "@/lib/upload-image";

type StorePlanPaymentFormProps = {
  targetPlan: StorePlan;
  pendingRequest?: {
    id: string;
    amountIls: number;
    method: StorePlanPaymentMethod;
    proofUrl: string;
    createdAt: Date;
  } | null;
};

export function StorePlanPaymentForm({ targetPlan, pendingRequest }: StorePlanPaymentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [method, setMethod] = useState<StorePlanPaymentMethod>("BANK_OF_PALESTINE");
  const [proofUrl, setProofUrl] = useState("");
  const [payerName, setPayerName] = useState("");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const selectedMethod = paymentMethods[method];
  const plan = storePlans[targetPlan];
  const canSubmit = Boolean(proofUrl) && !isUploading && !isPending;

  const submitLabel = useMemo(() => {
    if (isPending) return "جاري إرسال الطلب...";
    if (isUploading) return "جاري رفع الإشعار...";
    return "إرسال إشعار الدفع للمراجعة";
  }, [isPending, isUploading]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setIsUploading(true);

    try {
      const uploadedUrl = await uploadPaymentProofImage(file);
      setProofUrl(uploadedUrl);
      toast.success("تم رفع إشعار الدفع");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر رفع إشعار الدفع");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!proofUrl) {
      toast.error("ارفع إشعار الدفع أولاً");
      return;
    }

    startTransition(async () => {
      const result = await createStorePlanPaymentRequestAction({
        targetPlan,
        method,
        proofUrl,
        payerName,
        reference,
        note,
      });

      if (result.ok) {
        toast.success(result.message);
        router.push("/dashboard/store");
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  }

  if (pendingRequest) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
        <p className="text-sm font-bold text-amber-700">طلب دفع قيد المراجعة</p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
          تم استلام إشعار الدفع لهذه الباقة
        </h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          ستراجع الإدارة الإشعار، وعند الموافقة سيتم تفعيل الباقة تلقائياً.
        </p>
        <a
          href={pendingRequest.proofUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-bold text-slate-700 shadow-sm"
        >
          عرض إشعار الدفع
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-primary-dark">الخطوة 1</p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-950">اختر طريقة الدفع</h2>
          <div className="mt-4 grid gap-3">
            {paymentMethodOrder.map((item) => {
              const config = paymentMethods[item];
              const isSelected = item === method;

              return (
                <label
                  key={item}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={item}
                    checked={isSelected}
                    onChange={() => setMethod(item)}
                    className="sr-only"
                  />
                  <span className="block font-extrabold text-slate-950">{config.label}</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">
                    {config.description}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-primary-dark">الخطوة 2</p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-950">بيانات التحويل</h2>
          <div className="mt-4 grid gap-3">
            {selectedMethod.details.map((detail) => (
              <div
                key={detail.label}
                className="flex flex-col gap-1 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-semibold text-slate-500">{detail.label}</span>
                <span className="font-bold text-slate-950">{detail.value}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm leading-7 text-amber-800">
            {selectedMethod.note}
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-primary-dark">الخطوة 3</p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-950">ارفع إشعار الدفع</h2>
          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition hover:border-primary/40 hover:bg-primary/5">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleFileChange}
              disabled={isUploading || isPending}
            />
            {isUploading ? (
              <Loader2 className="size-8 animate-spin text-primary" />
            ) : (
              <UploadCloud className="size-8 text-primary" />
            )}
            <span className="mt-3 font-bold text-slate-950">اضغط لاختيار صورة الإشعار</span>
            <span className="mt-1 text-sm text-slate-500">
              JPG أو PNG أو WebP، حتى 1MB بعد الضغط
            </span>
          </label>

          {proofUrl ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="relative aspect-[16/9]">
                <Image src={proofUrl} alt="إشعار الدفع" fill className="object-cover" />
              </div>
              <button
                type="button"
                onClick={() => setProofUrl("")}
                className="flex min-h-11 w-full items-center justify-center gap-2 text-sm font-bold text-red-600"
              >
                <X className="size-4" />
                إزالة الإشعار
              </button>
            </div>
          ) : null}
        </section>
      </div>

      <aside className="space-y-5">
        <section className="rounded-3xl border border-primary/15 bg-primary/5 p-5 shadow-sm">
          <p className="text-sm font-bold text-primary-dark">ملخص الاشتراك</p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-950">باقة {plan.label}</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">{plan.description}</p>
          <div className="mt-5 rounded-2xl bg-white p-4">
            <p className="text-3xl font-extrabold text-slate-950">{plan.listingLimit}</p>
            <p className="text-sm text-slate-500">منتج أو خدمة</p>
          </div>
          <div className="mt-4 text-2xl font-extrabold text-primary-dark">
            {formatStorePlanPrice(plan.priceIls)}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-4">
            <Field
              label="اسم المحول"
              value={payerName}
              onChange={setPayerName}
              placeholder="اختياري، لكنه يساعد في المراجعة"
            />
            <Field
              label="رقم العملية"
              value={reference}
              onChange={setReference}
              placeholder="اختياري"
            />
            <div>
              <Label htmlFor="payment-note">ملاحظة للإدارة</Label>
              <textarea
                id="payment-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="mt-1 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="أي تفاصيل إضافية عن عملية الدفع"
              />
            </div>
          </div>
          <Button type="submit" className="mt-5 h-12 w-full" disabled={!canSubmit}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {submitLabel}
          </Button>
        </section>
      </aside>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 h-12 text-base"
      />
    </div>
  );
}
