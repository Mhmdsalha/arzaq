"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { registerAction } from "@/actions/auth.actions";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { regionLabels } from "@/constants/regions";
import { registerSchema, type RegisterInput } from "@/schemas/auth.schema";

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      region: "GAZA_CITY",
    },
  });

  function onSubmit(values: RegisterInput) {
    startTransition(async () => {
      const result = await registerAction(values);

      if (!result.ok) {
        toast.error(result.message);
      }
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-slate-950">إنشاء حساب</h1>
        <p className="text-sm text-slate-600">سجل حسابك لبناء ملفك أو نشر طلباتك لاحقًا.</p>
      </div>

      <TextField id="name" label="الاسم" error={errors.name?.message} {...register("name")} />
      <TextField
        id="phone"
        label="رقم الجوال"
        placeholder="059..."
        autoComplete="tel"
        error={errors.phone?.message}
        {...register("phone")}
      />
      <TextField
        id="email"
        label="البريد الإلكتروني اختياري"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
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

      <PasswordField
        id="password"
        label="كلمة المرور"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
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
