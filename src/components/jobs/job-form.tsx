"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createJobAction, updateJobAction } from "@/actions/job.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { workModeLabels } from "@/constants/jobs";
import { regionLabels } from "@/constants/regions";
import { createJobSchema, type CreateJobInput } from "@/schemas/job.schema";
import type { JobCategoryOption, JobFormData } from "@/types/job";

export function JobForm({
  categories,
  mode,
  initialData,
}: {
  categories: JobCategoryOption[];
  mode: "create" | "edit";
  initialData?: JobFormData;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      categoryId: initialData?.categoryId ?? categories[0]?.id ?? "",
      region: initialData?.region ?? "GAZA_CITY",
      workMode: initialData?.workMode ?? "BOTH",
      budget: initialData?.budget ?? "",
      duration: initialData?.duration ?? "",
      isUrgent: initialData?.isUrgent ?? false,
      expiresAt: initialData?.expiresAt ?? "",
    },
  });

  function onSubmit(values: CreateJobInput) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createJobAction(values)
          : await updateJobAction(initialData?.id ?? "", values);

      if (result.ok) {
        toast.success(result.message);
        router.push("/dashboard/jobs");
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="space-y-5 p-6">
          {initialData && initialData.offersCount > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              لديك عروض على هذا الطلب، التعديل سيُبلّغ المتقدمين لاحقًا عند تفعيل الإشعارات
              التفصيلية.
            </div>
          ) : null}

          <TextField
            id="title"
            label="عنوان الطلب"
            placeholder="مثلاً: تصميم صفحة هبوط لمشروع صغير"
            error={errors.title?.message}
            {...register("title")}
          />

          <TextAreaField
            id="description"
            label="وصف تفصيلي"
            placeholder="اشرح المطلوب، المخرجات المتوقعة، وأي تفاصيل تساعد مقدم الخدمة"
            error={errors.description?.message}
            {...register("description")}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              id="categoryId"
              label="التصنيف"
              error={errors.categoryId?.message}
              {...register("categoryId")}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </SelectField>

            <SelectField
              id="region"
              label="المنطقة"
              error={errors.region?.message}
              {...register("region")}
            >
              {Object.entries(regionLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              id="workMode"
              label="طريقة العمل"
              error={errors.workMode?.message}
              {...register("workMode")}
            >
              {Object.entries(workModeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectField>
            <TextField
              id="budget"
              label="الميزانية"
              placeholder="50₪ / مفتوح / حسب الاتفاق"
              error={errors.budget?.message}
              {...register("budget")}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              id="duration"
              label="المدة المتوقعة"
              placeholder="يوم / أسبوع / حسب الاتفاق"
              error={errors.duration?.message}
              {...register("duration")}
            />
            <TextField
              id="expiresAt"
              label="تاريخ الانتهاء"
              type="date"
              error={errors.expiresAt?.message}
              {...register("expiresAt")}
            />
          </div>

          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
            <input
              type="checkbox"
              className="rounded border-amber-300 text-primary focus:ring-primary"
              {...register("isUrgent")}
            />
            طلب عاجل
          </label>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isPending ? "جاري الحفظ..." : mode === "create" ? "نشر الطلب" : "حفظ التعديلات"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

function TextField({
  id,
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} aria-invalid={Boolean(error)} {...props} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function SelectField({
  id,
  label,
  error,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-invalid={Boolean(error)}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function TextAreaField({
  id,
  label,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  error?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
        className="min-h-40 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm leading-7 transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
