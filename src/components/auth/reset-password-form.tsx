"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { resetPasswordAction } from "@/actions/auth.actions";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { resetPasswordSchema, type ResetPasswordInput } from "@/schemas/auth.schema";

export function ResetPasswordForm({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
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

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold text-slate-950">رابط غير صالح</h1>
        <p className="text-sm leading-6 text-slate-600">
          رابط إعادة التعيين غير مكتمل. اطلب رابطًا جديدًا.
        </p>
        <Button asChild className="w-full">
          <Link href="/auth/forgot-password">طلب رابط جديد</Link>
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" {...register("token")} />
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-slate-950">تعيين كلمة مرور جديدة</h1>
        <p className="text-sm text-slate-600">اختر كلمة مرور قوية لحسابك.</p>
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
    </form>
  );
}
