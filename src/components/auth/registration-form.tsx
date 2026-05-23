"use client";

import type { AccountType } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { registerAction } from "@/actions/auth.actions";
import { AccountTypeSelector } from "@/components/auth/account-type-selector";
import { PasswordField } from "@/components/auth/password-field";
import { SkillsSelector } from "@/components/profile/skills-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { regionLabels } from "@/constants/regions";
import { cn } from "@/lib/utils";
import { registerSchema, type RegisterInput } from "@/schemas/register.schema";
import type { SkillOption } from "@/types/profile";

export function RegistrationForm({ skills }: { skills: SkillOption[] }) {
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType | null>(null);
  const [step, setStep] = useState<"type" | "form">("type");

  if (step === "type" || !selectedAccountType) {
    return (
      <AccountTypeSelector
        selected={selectedAccountType}
        onSelect={setSelectedAccountType}
        onContinue={() => {
          if (!selectedAccountType) {
            toast.error("اختر نوع حسابك للمتابعة");
            return;
          }

          setStep("form");
        }}
      />
    );
  }

  return (
    <RegistrationDetailsForm
      key={selectedAccountType}
      accountType={selectedAccountType}
      skills={skills}
      onChangeType={() => setStep("type")}
    />
  );
}

function RegistrationDetailsForm({
  accountType,
  skills,
  onChangeType,
}: {
  accountType: AccountType;
  skills: SkillOption[];
  onChangeType: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      accountType,
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      region: "GAZA_CITY",
      skills: [],
    },
  });
  const selectedSkillIds = useWatch({ control, name: "skills" }) ?? [];

  function onSubmit(values: RegisterInput) {
    startTransition(async () => {
      const result = await registerAction({ ...values, accountType });

      if (!result.ok) {
        toast.error(result.message);
      }
    });
  }

  const isProvider = accountType === "PROVIDER";

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-slate-950">إنشاء حساب</h1>
        <p className="text-sm text-slate-600">أكمل بياناتك الأساسية للانضمام إلى أرزاق.</p>
      </div>

      <input type="hidden" {...register("accountType")} />

      <div
        className={cn(
          "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold",
          isProvider
            ? "border-blue-200 bg-blue-50 text-blue-800"
            : "border-green-200 bg-green-50 text-green-800",
        )}
      >
        <span>{isProvider ? "🛠️ مقدم خدمة" : "📋 صاحب طلب"}</span>
        <button type="button" className="text-xs underline" onClick={onChangeType}>
          تغيير
        </button>
      </div>

      <TextField
        id="name"
        label="الاسم الكامل"
        error={errors.name?.message}
        {...register("name")}
      />
      <TextField
        id="phone"
        label="رقم الجوال"
        placeholder="059..."
        autoComplete="tel"
        error={errors.phone?.message}
        {...register("phone")}
      />

      <div className="grid gap-2">
        <Label htmlFor="region">المنطقة</Label>
        <select
          id="region"
          className="h-11 rounded-xl border-slate-200 bg-white text-sm focus:border-primary focus:ring-primary"
          aria-invalid={Boolean(errors.region)}
          {...register("region")}
        >
          {Object.entries(regionLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.region ? <p className="text-sm text-red-600">{errors.region.message}</p> : null}
      </div>

      {isProvider ? (
        <div className="space-y-2">
          <SkillsSelector
            skills={skills}
            selectedSkillIds={selectedSkillIds}
            error={errors.skills?.message}
            onChange={(skillIds) =>
              setValue("skills", skillIds, { shouldDirty: true, shouldValidate: true })
            }
          />
          <p className="text-xs text-slate-500">يمكنك إضافة المزيد لاحقاً من بروفايلك</p>
        </div>
      ) : null}

      <PasswordField
        id="password"
        label="كلمة المرور"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <PasswordField
        id="confirmPassword"
        label="تأكيد كلمة المرور"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? "جاري إنشاء الحساب..."
          : isProvider
            ? "إنشاء حساب مقدم خدمة"
            : "إنشاء حساب صاحب طلب"}
      </Button>

      <p className="text-center text-sm text-slate-600">
        لديك حساب؟{" "}
        <Link href="/auth/login" className="font-semibold text-primary-dark">
          سجل الدخول
        </Link>
      </p>
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
