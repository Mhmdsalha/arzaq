"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { resendEmailVerificationAction, verifyEmailAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyEmailSchema, type VerifyEmailInput } from "@/schemas/auth.schema";

export function VerifyEmailForm({ email }: { email: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email,
      code: "",
    },
  });

  function onSubmit(values: VerifyEmailInput) {
    startTransition(async () => {
      const result = await verifyEmailAction(values);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.push(result.redirectTo ?? "/auth/login?verified=success");
    });
  }

  function resendCode() {
    startResendTransition(async () => {
      const result = await resendEmailVerificationAction(email);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-2">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
          <MailCheck className="size-6" />
        </div>
        <h1 className="font-palestine text-3xl font-bold leading-10 text-slate-950">
          توثيق البريد الإلكتروني
        </h1>
        <p className="text-sm leading-6 text-slate-500">
          أدخل رمز التحقق المرسل إلى <span className="font-semibold text-slate-700">{email}</span>
        </p>
      </div>

      <input type="hidden" {...register("email")} />

      <div className="grid gap-1.5">
        <Label htmlFor="code" className="text-sm font-medium text-slate-700">
          رمز التحقق
        </Label>
        <Input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          maxLength={6}
          className="h-12 rounded-xl border-slate-200 text-center font-mono text-xl tracking-[0.35em] focus:border-primary focus-visible:ring-primary/20"
          aria-invalid={Boolean(errors.code)}
          {...register("code")}
        />
        {errors.code ? <p className="text-xs text-red-500">{errors.code.message}</p> : null}
      </div>

      <Button
        type="submit"
        className="h-12 w-full rounded-xl bg-primary text-base font-semibold shadow-md shadow-green-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 active:scale-[0.98]"
        disabled={isPending}
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {isPending ? "جاري التحقق..." : "توثيق البريد"}
      </Button>

      <div className="space-y-3 text-center text-sm">
        <button
          type="button"
          onClick={resendCode}
          disabled={isResending}
          className="font-semibold text-primary-dark disabled:opacity-60"
        >
          {isResending ? "جاري إعادة الإرسال..." : "إعادة إرسال الرمز"}
        </button>
        <p className="text-slate-500">
          لديك حساب موثق؟{" "}
          <Link href="/auth/login" className="font-semibold text-primary-dark">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </motion.form>
  );
}
