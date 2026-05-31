"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { adminLoginAction } from "@/actions/auth.actions";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/schemas/auth.schema";

export function AdminLoginForm() {
  const submittingRef = useRef(false);
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

  function onSubmit(values: LoginInput) {
    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    startTransition(async () => {
      const result = await adminLoginAction(values);

      if (!result.ok) {
        submittingRef.current = false;
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      const signInResult = await signIn("credentials", {
        identifier: values.identifier,
        password: values.password,
        redirect: false,
      });

      if (signInResult?.error) {
        submittingRef.current = false;
        toast.error(result.message);
        return;
      }

      window.location.assign(result.redirectTo ?? "/admin");
    });
  }

  return (
    <form
      className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white p-6 text-slate-950 shadow-2xl"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="mb-6 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="size-7" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">دخول الإدارة</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          هذه الصفحة منفصلة عن دخول المستخدمين ومخصصة لحسابات المديرين فقط.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-1.5">
          <Label htmlFor="admin-identifier">البريد الإلكتروني أو رقم الجوال</Label>
          <Input
            id="admin-identifier"
            type="text"
            autoComplete="username"
            className="h-12 rounded-xl text-right text-base"
            placeholder="admin@arzaq.local"
            aria-invalid={Boolean(errors.identifier)}
            {...register("identifier")}
          />
          {errors.identifier ? (
            <p className="text-xs text-red-500">{errors.identifier.message}</p>
          ) : null}
        </div>

        <PasswordField
          id="admin-password"
          label="كلمة المرور"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>

      <Button type="submit" className="mt-6 h-12 w-full rounded-xl" disabled={isPending}>
        {isPending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            جاري التحقق...
          </span>
        ) : (
          "الدخول إلى لوحة الإدارة"
        )}
      </Button>
    </form>
  );
}
