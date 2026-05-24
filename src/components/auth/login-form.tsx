"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
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

export function LoginForm({
  resetSuccess = false,
  callbackUrl,
}: {
  resetSuccess?: boolean;
  callbackUrl?: string;
}) {
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
      const result = await loginAction(values, callbackUrl);

      if (!result.ok) {
        toast.error(result.message);
      }
    });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2"
      >
        <h1 className="font-palestine text-3xl font-bold leading-10 text-slate-950">
          مرحباً بعودتك
        </h1>
        <p className="text-sm text-slate-500">سجّل دخولك للوصول إلى حسابك</p>
      </motion.div>

      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="grid gap-1.5"
        >
          <Label htmlFor="identifier" className="text-sm font-medium text-slate-700">
            رقم الجوال
          </Label>
          <Input
            id="identifier"
            type="text"
            autoComplete="username"
            placeholder="059..."
            aria-invalid={Boolean(errors.identifier)}
            className="h-12 rounded-xl border-slate-200 px-4 text-right text-base focus:border-primary focus-visible:ring-primary/20"
            {...register("identifier")}
          />
          {errors.identifier ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-red-500"
            >
              {errors.identifier.message}
            </motion.p>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.14 }}
        >
          <PasswordField
            id="password"
            label="كلمة المرور"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="text-right"
        >
          <Link href="/auth/forgot-password" className="text-sm font-medium text-primary-dark">
            نسيت كلمة المرور؟
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.26 }}
        className="space-y-5"
      >
        <Button
          type="submit"
          className="h-12 w-full rounded-xl bg-primary text-base font-semibold shadow-md shadow-green-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 active:scale-[0.98]"
          disabled={isPending}
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              جارٍ تسجيل الدخول...
            </span>
          ) : (
            "تسجيل الدخول"
          )}
        </Button>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          <span>أو</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <p className="text-center text-sm text-slate-600">
          ليس لديك حساب؟{" "}
          <Link href="/auth/register" className="font-semibold text-primary-dark">
            إنشاء حساب
          </Link>
        </p>
      </motion.div>
    </form>
  );
}
