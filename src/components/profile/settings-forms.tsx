"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { changePasswordAction, updateAccountSettingsAction } from "@/actions/settings.actions";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  accountSettingsSchema,
  changePasswordSchema,
  type AccountSettingsInput,
  type ChangePasswordInput,
} from "@/schemas/settings.schema";
import type { AccountSettingsData } from "@/types/profile";

export function SettingsForms({ data }: { data: AccountSettingsData }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <AccountSettingsForm data={data} />
      <ChangePasswordForm />
    </div>
  );
}

function AccountSettingsForm({ data }: { data: AccountSettingsData }) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountSettingsInput>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      phone: data.phone,
      email: data.email,
    },
  });

  function onSubmit(values: AccountSettingsInput) {
    startTransition(async () => {
      const result = await updateAccountSettingsAction(values);

      if (result.ok) {
        toast.success(result.message);
        return;
      }

      toast.error(result.message);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">بيانات الحساب</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            id="phone"
            label="رقم الجوال"
            inputMode="tel"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <TextField
            id="email"
            label="البريد الإلكتروني"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isPending ? "جاري الحفظ..." : "حفظ بيانات الحساب"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: ChangePasswordInput) {
    startTransition(async () => {
      const result = await changePasswordAction(values);

      if (result.ok) {
        toast.success(result.message);
        reset();
        return;
      }

      toast.error(result.message);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">تغيير كلمة المرور</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <PasswordField
            id="currentPassword"
            label="كلمة المرور الحالية"
            error={errors.currentPassword?.message}
            autoComplete="current-password"
            {...register("currentPassword")}
          />
          <PasswordField
            id="newPassword"
            label="كلمة المرور الجديدة"
            error={errors.newPassword?.message}
            autoComplete="new-password"
            {...register("newPassword")}
          />
          <PasswordField
            id="confirmPassword"
            label="تأكيد كلمة المرور"
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isPending ? "جاري التغيير..." : "تغيير كلمة المرور"}
          </Button>
        </form>
      </CardContent>
    </Card>
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
