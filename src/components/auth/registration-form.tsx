"use client";

import type { AccountType } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { registerAction } from "@/actions/auth.actions";
import { AccountTypeCards } from "@/components/auth/AccountTypeCards";
import { PasswordField } from "@/components/auth/password-field";
import { StepIndicator } from "@/components/auth/StepIndicator";
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
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <div>
      <StepIndicator currentStep={step} />
      <AnimatePresence mode="wait">
        {step === 1 || !selectedAccountType ? (
          <motion.div
            key="account-type"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h1 className="font-palestine text-3xl font-bold leading-10 text-slate-950">
                كيف ستستخدم أرزاق؟
              </h1>
              <p className="text-sm text-slate-500">
                اختر نوع حسابك، يمكنك تغييره لاحقاً من الإعدادات
              </p>
            </div>

            <AccountTypeCards selected={selectedAccountType} onSelect={setSelectedAccountType} />

            <Button
              type="button"
              disabled={!selectedAccountType}
              className="h-12 w-full rounded-xl bg-primary text-base font-semibold shadow-md shadow-green-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 active:scale-[0.98]"
              onClick={() => {
                if (!selectedAccountType) {
                  toast.error("اختر نوع حسابك للمتابعة");
                  return;
                }

                setStep(2);
              }}
            >
              متابعة
            </Button>
          </motion.div>
        ) : (
          <RegistrationDetailsForm
            key={selectedAccountType}
            accountType={selectedAccountType}
            skills={skills}
            onChangeType={() => setStep(1)}
          />
        )}
      </AnimatePresence>
    </div>
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
  const isProvider = accountType === "PROVIDER";

  function onSubmit(values: RegisterInput) {
    startTransition(async () => {
      const result = await registerAction({ ...values, accountType });

      if (!result.ok) {
        toast.error(result.message);
      }
    });
  }

  return (
    <motion.form
      key="registration-form"
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -28 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-5 pb-8"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-2">
        <h1 className="font-palestine text-3xl font-bold leading-10 text-slate-950">
          أكمل بياناتك
        </h1>
        <p className="text-sm text-slate-500">بيانات بسيطة لنجهّز حسابك على أرزاق</p>
      </div>

      <input type="hidden" {...register("accountType")} />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={cn(
          "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold",
          isProvider
            ? "border-blue-200 bg-blue-50 text-blue-800"
            : "border-green-200 bg-green-50 text-green-800",
        )}
      >
        <span>{isProvider ? "مقدم خدمة" : "صاحب طلب"}</span>
        <button type="button" className="text-xs text-slate-500 underline" onClick={onChangeType}>
          تغيير نوع الحساب
        </button>
      </motion.div>

      <AnimatedField delay={0.06}>
        <TextField
          id="name"
          label="الاسم الكامل"
          error={errors.name?.message}
          {...register("name")}
        />
      </AnimatedField>

      <AnimatedField delay={0.12}>
        <TextField
          id="phone"
          label="رقم الجوال"
          placeholder="059..."
          autoComplete="tel"
          error={errors.phone?.message}
          {...register("phone")}
        />
      </AnimatedField>

      <AnimatedField delay={0.18}>
        <div className="grid gap-1.5">
          <Label htmlFor="region" className="text-sm font-medium text-slate-700">
            المنطقة
          </Label>
          <select
            id="region"
            className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-right text-base text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            aria-invalid={Boolean(errors.region)}
            {...register("region")}
          >
            {Object.entries(regionLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.region ? <p className="text-xs text-red-500">{errors.region.message}</p> : null}
        </div>
      </AnimatedField>

      {isProvider ? (
        <AnimatedField delay={0.24}>
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
        </AnimatedField>
      ) : null}

      <AnimatedField delay={isProvider ? 0.3 : 0.24}>
        <PasswordField
          id="password"
          label="كلمة المرور"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
      </AnimatedField>

      <AnimatedField delay={isProvider ? 0.36 : 0.3}>
        <PasswordField
          id="confirmPassword"
          label="تأكيد المرور"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
      </AnimatedField>

      <AnimatedField delay={isProvider ? 0.42 : 0.36}>
        <Button
          type="submit"
          className="h-12 w-full rounded-xl bg-primary text-base font-semibold shadow-md shadow-green-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 active:scale-[0.98]"
          disabled={isPending}
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              جارٍ إنشاء الحساب...
            </span>
          ) : (
            "إنشاء الحساب"
          )}
        </Button>
      </AnimatedField>

      <p className="text-center text-sm text-slate-600">
        لديك حساب؟{" "}
        <Link href="/auth/login" className="font-semibold text-primary-dark">
          تسجيل الدخول
        </Link>
      </p>
    </motion.form>
  );
}

function AnimatedField({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      {children}
    </motion.div>
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
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </Label>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        className="h-12 rounded-xl border-slate-200 px-4 text-right text-base focus:border-primary focus-visible:ring-primary/20"
        {...props}
      />
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
