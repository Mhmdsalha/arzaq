"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { resetPasswordAction } from "@/actions/auth.actions";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordSchema, type ResetPasswordInput } from "@/schemas/auth.schema";

export function ResetPasswordForm({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email,
      code: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: ResetPasswordInput) {
    startTransition(async () => {
      const result = await resetPasswordAction(values);

      if (!result.ok) {
        toast.error(result.message);
      }
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-slate-950">تعيين كلمة مرور جديدة</h1>
        <p className="text-sm leading-6 text-slate-600">
          أدخل الرمز المرسل إلى بريدك ثم اختر كلمة مرور قوية لحسابك.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          dir="ltr"
          className="text-left"
          placeholder="example@email.com"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        {errors.email ? <p className="text-sm text-red-600">{errors.email.message}</p> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="code">رمز إعادة التعيين</Label>
        <Input
          id="code"
          inputMode="numeric"
          dir="ltr"
          className="text-center tracking-[0.35em]"
          maxLength={6}
          autoComplete="one-time-code"
          placeholder="000000"
          aria-invalid={Boolean(errors.code)}
          {...register("code")}
        />
        {errors.code ? <p className="text-sm text-red-600">{errors.code.message}</p> : null}
      </div>

      <PasswordField
        id="password"
        label="كلمة المرور الجديدة"
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
        {isPending ? "جاري التحديث..." : "تحديث كلمة المرور"}
      </Button>

      <p className="text-center text-sm text-slate-600">
        لم يصلك الرمز؟{" "}
        <Link href="/auth/forgot-password" className="font-semibold text-primary-dark">
          اطلب رمزاً جديداً
        </Link>
      </p>
    </form>
  );
}
