"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { loginAction } from "@/actions/auth.actions";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/schemas/auth.schema";

export function LoginForm({ resetSuccess = false }: { resetSuccess?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  useEffect(() => {
    if (resetSuccess) {
      toast.success("تم تحديث كلمة المرور، يمكنك تسجيل الدخول الآن");
    }
  }, [resetSuccess]);

  function onSubmit(values: LoginInput) {
    startTransition(async () => {
      const result = await loginAction(values);

      if (!result.ok) {
        toast.error(result.message);
      }
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-slate-950">تسجيل الدخول</h1>
        <p className="text-sm text-slate-600">ادخل إلى حسابك لمتابعة طلباتك وعروضك.</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="identifier">البريد الإلكتروني أو رقم الجوال</Label>
        <Input
          id="identifier"
          type="text"
          autoComplete="username"
          placeholder="example@email.com أو 059..."
          aria-invalid={Boolean(errors.identifier)}
          {...register("identifier")}
        />
        {errors.identifier ? (
          <p className="text-sm text-red-600">{errors.identifier.message}</p>
        ) : null}
      </div>

      <PasswordField
        id="password"
        label="كلمة المرور"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="flex items-center justify-between gap-3 text-sm">
        <Link href="/auth/forgot-password" className="font-medium text-primary-dark">
          نسيت كلمة المرور؟
        </Link>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "جاري تسجيل الدخول..." : "دخول"}
      </Button>

      <p className="text-center text-sm text-slate-600">
        ليس لديك حساب؟{" "}
        <Link href="/auth/register" className="font-semibold text-primary-dark">
          أنشئ حسابًا
        </Link>
      </p>
    </form>
  );
}
