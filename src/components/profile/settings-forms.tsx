"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { AccountType } from "@prisma/client";
import { AlertTriangle, Loader2, Save, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  changePasswordAction,
  switchAccountTypeAction,
  updateAccountSettingsAction,
} from "@/actions/settings.actions";
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
    <div className="space-y-6">
      <AccountTypeSwitcher data={data} />
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <AccountSettingsForm data={data} />
        <ChangePasswordForm />
      </div>
    </div>
  );
}

function AccountTypeSwitcher({ data }: { data: AccountSettingsData }) {
  const router = useRouter();
  const { update } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAccountType, setCurrentAccountType] = useState<AccountType>(data.accountType);
  const [isPending, startTransition] = useTransition();
  const isProvider = currentAccountType === "PROVIDER";
  const targetType = isProvider ? "CLIENT" : "PROVIDER";
  const dialogMessage = isProvider
    ? "ستتمكن من نشر الطلبات والحصول على عروض. لن تتمكن من تقديم عروض جديدة بعد التغيير."
    : "ستتمكن من تقديم العروض وبناء بروفايل مهني. لن تتمكن من نشر طلبات جديدة بعد التغيير.";
  const confirmLabel = isProvider ? "تحويل إلى صاحب طلب" : "تحويل إلى مقدم خدمة";

  function confirmSwitch() {
    startTransition(async () => {
      const result = await switchAccountTypeAction(targetType);

      if (result.ok) {
        setCurrentAccountType(targetType);
        setIsDialogOpen(false);
        await update({
          user: {
            accountType: targetType,
          },
        });
        router.refresh();
        toast.success(result.message);
        return;
      }

      toast.error(result.message);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">نوع الحساب</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary-dark">
            {isProvider ? "🛠️ مقدم خدمة" : "📋 صاحب طلب"}
          </span>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            يمكنك تغيير نوع الحساب مع الحفاظ على تاريخك وبيانات بروفايلك.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsDialogOpen(true)}
          disabled={isPending}
        >
          {isPending ? "جاري التحويل..." : "تغيير نوع الحساب"}
        </Button>
      </CardContent>

      {isDialogOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="account-type-dialog-title"
        >
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-right shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-700">
                <AlertTriangle className="size-6" />
              </span>
              <button
                type="button"
                className="grid size-10 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setIsDialogOpen(false)}
                aria-label="إغلاق النافذة"
                disabled={isPending}
              >
                <X className="size-5" />
              </button>
            </div>

            <h2 id="account-type-dialog-title" className="mt-5 text-2xl font-bold text-slate-950">
              تأكيد تغيير نوع الحساب
            </h2>
            <p className="mt-3 leading-7 text-slate-600">{dialogMessage}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button type="button" onClick={confirmSwitch} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    جاري التحويل...
                  </>
                ) : (
                  confirmLabel
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsDialogOpen(false)}
                disabled={isPending}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
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
