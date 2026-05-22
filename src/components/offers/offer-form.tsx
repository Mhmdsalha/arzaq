"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createOfferAction, updateOfferAction } from "@/actions/offer.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOfferSchema, type CreateOfferInput } from "@/schemas/offer.schema";
import type { OfferFormDefaults } from "@/types/offer";

export function OfferForm({
  jobPostId,
  offerId,
  mode = "create",
  defaults,
  onDone,
}: {
  jobPostId: string;
  offerId?: string;
  mode?: "create" | "edit";
  defaults?: OfferFormDefaults;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOfferInput>({
    resolver: zodResolver(createOfferSchema),
    defaultValues: {
      jobPostId,
      message: defaults?.message ?? "",
      price: defaults?.price === "حسب الاتفاق" ? "" : (defaults?.price ?? ""),
      duration: defaults?.duration === "حسب الاتفاق" ? "" : (defaults?.duration ?? ""),
    },
  });

  function onSubmit(values: CreateOfferInput) {
    startTransition(async () => {
      const result =
        mode === "edit" && offerId
          ? await updateOfferAction(offerId, {
              message: values.message,
              price: values.price,
              duration: values.duration,
            })
          : await createOfferAction(values);

      if (result.ok) {
        toast.success(result.message);
        onDone?.();
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  }

  return (
    <form
      id="offer"
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <input type="hidden" {...register("jobPostId")} />
      <div className="grid gap-2">
        <Label htmlFor={`offer-message-${jobPostId}`}>رسالة العرض</Label>
        <textarea
          id={`offer-message-${jobPostId}`}
          className="min-h-32 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm leading-7 transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="عرّف بنفسك واشرح كيف ستنفذ الطلب"
          aria-invalid={Boolean(errors.message)}
          {...register("message")}
        />
        {errors.message ? <p className="text-sm text-red-600">{errors.message.message}</p> : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`offer-price-${jobPostId}`}>السعر المقترح</Label>
          <Input
            id={`offer-price-${jobPostId}`}
            placeholder="50₪ / حسب الاتفاق"
            aria-invalid={Boolean(errors.price)}
            {...register("price")}
          />
          {errors.price ? <p className="text-sm text-red-600">{errors.price.message}</p> : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`offer-duration-${jobPostId}`}>مدة التسليم</Label>
          <Input
            id={`offer-duration-${jobPostId}`}
            placeholder="3 أيام / أسبوع"
            aria-invalid={Boolean(errors.duration)}
            {...register("duration")}
          />
          {errors.duration ? (
            <p className="text-sm text-red-600">{errors.duration.message}</p>
          ) : null}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {isPending ? "جاري الإرسال..." : mode === "edit" ? "حفظ العرض" : "إرسال العرض"}
      </Button>
    </form>
  );
}
