"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { forgotPasswordAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/schemas/auth.schema";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: "",
    },
  });

  function onSubmit(values: ForgotPasswordInput) {
    setResetUrl(null);
    startTransition(async () => {
      const result = await forgotPasswordAction(values);

      if (result.ok) {
        toast.success(result.message);
        setResetUrl(result.resetUrl ?? null);
        return;
      }

      toast.error(result.message);
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-slate-950">استعادة كلمة المرور</h1>
        <p className="text-sm leading-6 text-slate-600">
          أدخل بريدك أو رقم جوالك. في هذه المرحلة يظهر رابط تجريبي بدل الإرسال الفعلي.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="identifier">البريد الإلكتروني أو رقم الجوال</Label>
        <Input
          id="identifier"
          type="text"
          placeholder="example@email.com أو 059..."
          aria-invalid={Boolean(errors.identifier)}
          {...register("identifier")}
        />
        {errors.identifier ? (
          <p className="text-sm text-red-600">{errors.identifier.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "جاري التجهيز..." : "تجهيز رابط إعادة التعيين"}
      </Button>

      {resetUrl ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
          رابط تجريبي:{" "}
          <Link href={resetUrl} className="font-semibold text-primary-dark underline">
            افتح صفحة إعادة التعيين
          </Link>
        </div>
      ) : null}

      <p className="text-center text-sm text-slate-600">
        تذكرت كلمة المرور؟{" "}
        <Link href="/auth/login" className="font-semibold text-primary-dark">
          تسجيل الدخول
        </Link>
      </p>
    </form>
  );
}
