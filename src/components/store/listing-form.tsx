"use client";

import type { DeliveryMethod, ListingType, Region } from "@prisma/client";
import { Loader2, Save, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { createListingAction, updateListingAction } from "@/actions/listing.actions";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deliveryMethodLabels,
  listingDeliveryTimeOptions,
  listingPriceLabelOptions,
  listingTypeLabels,
} from "@/constants/store";
import { regionLabels } from "@/constants/regions";
import type { CreateListingInput, UpdateListingInput } from "@/schemas/listing.schema";
import type { ListingCategoryOption, ListingFormData } from "@/types/store";

type ListingFormProps = {
  categories: ListingCategoryOption[];
  mode: "create" | "edit";
  initialData?: ListingFormData;
};

export function ListingForm({ categories, mode, initialData }: ListingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<ListingType>(initialData?.type ?? "SERVICE");
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.images ?? []);

  const tagsText = useMemo(() => initialData?.tags.join(", ") ?? "", [initialData]);
  const priceLabelOptions = useMemo(
    () => withCurrentOption(listingPriceLabelOptions, initialData?.priceLabel),
    [initialData?.priceLabel],
  );
  const deliveryTimeOptions = useMemo(
    () => withCurrentOption(listingDeliveryTimeOptions, initialData?.deliveryTime),
    [initialData?.deliveryTime],
  );

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = buildPayload(formData, type, imageUrls);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createListingAction(payload as CreateListingInput)
          : await updateListingAction(initialData?.id ?? "", payload as UpdateListingInput);

      if (result.ok) {
        toast.success(result.message);
        router.push("/dashboard/store");
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="space-y-4 p-3 sm:p-4 lg:space-y-5 lg:p-6">
          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-3 sm:p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-primary-dark">
              <ShoppingBag className="size-4" />
              نوع العنصر
              <span className="text-red-500" aria-hidden="true">*</span>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
              {(["SERVICE", "PHYSICAL"] as ListingType[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={mode === "edit"}
                  onClick={() => setType(value)}
                  className={`rounded-2xl border p-3 text-right transition sm:min-h-16 sm:p-4 ${
                    type === value
                      ? "border-primary bg-white shadow-sm ring-2 ring-primary/10"
                      : "border-slate-200 bg-white/70 text-slate-600"
                  } ${mode === "edit" ? "cursor-not-allowed opacity-80" : "hover:border-primary/60"}`}
                >
                  <span className="block text-base font-bold">{listingTypeLabels[value]}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {value === "SERVICE"
                      ? "خدمة جاهزة أو عمل قابل للطلب"
                      : "منتج مادي بكمية وسعر واضح"}
                  </span>
                </button>
              ))}
            </div>
            {mode === "edit" ? (
              <p className="mt-3 text-xs text-slate-500">لا يمكن تغيير نوع العنصر بعد إنشائه.</p>
            ) : null}
          </div>

          <TextField
            name="title"
            label="العنوان"
            required
            placeholder="مثلاً: تصميم شعار احترافي خلال يومين"
            defaultValue={initialData?.title ?? ""}
          />

          <TextAreaField
            name="description"
            label="الوصف التفصيلي"
            required
            placeholder="اشرح ما تقدمه، ما الذي يشمله السعر، وطريقة التسليم..."
            defaultValue={initialData?.description ?? ""}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              name="categoryId"
              label="التصنيف"
              required
              defaultValue={initialData?.categoryId ?? categories[0]?.id ?? ""}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </SelectField>

            <SelectField name="region" label="المنطقة" required defaultValue={initialData?.region ?? "GAZA_CITY"}>
              {Object.entries(regionLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              name="price"
              label="السعر بالشيكل"
              type="number"
              min="0"
              step="1"
              required
              defaultValue={initialData?.price ?? 0}
            />
            <SelectField
              name="priceLabel"
              label="وصف السعر"
              defaultValue={initialData?.priceLabel ?? ""}
            >
              <option value="">بدون وصف إضافي</option>
              {priceLabelOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              name="deliveryMethod"
              label="طريقة التسليم"
              required
              defaultValue={initialData?.deliveryMethod ?? "ONLINE"}
            >
              {Object.entries(deliveryMethodLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectField>
            <SelectField
              name="deliveryTime"
              label="مدة التسليم"
              defaultValue={initialData?.deliveryTime ?? ""}
            >
              <option value="">يُحدد لاحقاً</option>
              {deliveryTimeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </SelectField>
          </div>

          {type === "PHYSICAL" ? (
            <TextField
              name="quantity"
              label="الكمية المتاحة"
              type="number"
              min="0"
              step="1"
              required
              defaultValue={initialData?.quantity ?? 1}
            />
          ) : null}

          <ImageUploader
            value={imageUrls}
            onChange={setImageUrls}
            maxImages={5}
            folder="listings"
          />

          <TextField
            name="tags"
            label="وسوم البحث"
            placeholder="تصميم، شعار، سريع"
            defaultValue={tagsText}
          />

          <div className="flex justify-end">
            <Button type="submit" className="h-12 w-full sm:w-auto sm:min-w-[180px]" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {isPending
                ? "جاري الحفظ..."
                : mode === "create"
                  ? "إضافة إلى المتجر"
                  : "حفظ التعديلات"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

function withCurrentOption(
  options: readonly string[],
  currentValue?: string | null,
) {
  const current = currentValue?.trim();

  if (!current || options.includes(current)) {
    return options;
  }

  return [current, ...options];
}

function buildPayload(formData: FormData, type: ListingType, images: string[]) {
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    type,
    categoryId: String(formData.get("categoryId") ?? ""),
    region: String(formData.get("region") ?? "GAZA_CITY") as Region,
    price: Number(formData.get("price") ?? 0),
    priceLabel: String(formData.get("priceLabel") ?? ""),
    deliveryMethod: String(formData.get("deliveryMethod") ?? "ONLINE") as DeliveryMethod,
    deliveryTime: String(formData.get("deliveryTime") ?? ""),
    quantity: type === "PHYSICAL" ? Number(formData.get("quantity") ?? 0) : null,
    images,
    tags,
  };
}

function TextField({
  name,
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { name: string; label: string }) {
  return (
    <div className="grid gap-2">
      <FieldLabel htmlFor={name} required={Boolean(props.required)}>
        {label}
      </FieldLabel>
      <Input id={name} name={name} className="h-12 text-base" {...props} />
    </div>
  );
}

function SelectField({
  name,
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  name: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <FieldLabel htmlFor={name} required={Boolean(props.required)}>
        {label}
      </FieldLabel>
      <select
        id={name}
        name={name}
        className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

function TextAreaField({
  name,
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { name: string; label: string }) {
  return (
    <div className="grid gap-2">
      <FieldLabel htmlFor={name} required={Boolean(props.required)}>
        {label}
      </FieldLabel>
      <textarea
        id={name}
        name={name}
        className="min-h-32 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base leading-7 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        {...props}
      />
    </div>
  );
}

function FieldLabel({
  children,
  required,
  ...props
}: React.ComponentProps<typeof Label> & { required?: boolean }) {
  return (
    <Label {...props}>
      {children}
      {required ? <span className="mr-1 text-red-500" aria-hidden="true">*</span> : null}
    </Label>
  );
}
