"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { updateProfileAction } from "@/actions/profile.actions";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { PortfolioLinksEditor } from "@/components/profile/portfolio-links-editor";
import { RegionSelector } from "@/components/profile/region-selector";
import { SkillsSelector } from "@/components/profile/skills-selector";
import { WorkModeSelector } from "@/components/profile/work-mode-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileSchema, type ProfileInput } from "@/schemas/profile.schema";
import type { ProfileEditorData } from "@/types/profile";

export function ProfileForm({ data }: { data: ProfileEditorData }) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: data.profile.name,
      title: data.profile.title,
      bio: data.profile.bio,
      region: data.profile.region,
      workMode: data.profile.workMode,
      isAvailable: data.profile.isAvailable,
      skills: data.profile.skillIds,
      whatsapp: data.profile.whatsapp,
      avatarUrl: data.profile.avatarUrl,
      portfolioUrls: data.profile.portfolioUrls.length > 0 ? data.profile.portfolioUrls : [""],
    },
  });

  function onSubmit(values: ProfileInput) {
    startTransition(async () => {
      const result = await updateProfileAction(values);

      if (result.ok) {
        toast.success(result.message);
        return;
      }

      toast.error(result.message);
    });
  }

  const avatarUrl = useWatch({ control, name: "avatarUrl" }) ?? "";
  const selectedSkillIds = useWatch({ control, name: "skills" }) ?? [];
  const portfolioUrls = useWatch({ control, name: "portfolioUrls" }) ?? [""];
  const region = useWatch({ control, name: "region" });
  const workMode = useWatch({ control, name: "workMode" });
  const isProvider = data.profile.accountType === "PROVIDER";

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">بروفايلي</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <AvatarUploader
            userId={data.profile.userId}
            avatarUrl={avatarUrl}
            onUploaded={(url) =>
              setValue("avatarUrl", url, { shouldDirty: true, shouldValidate: true })
            }
          />
          <input type="hidden" {...register("avatarUrl")} />

          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              id="name"
              label="الاسم الكامل"
              error={errors.name?.message}
              {...register("name")}
            />
            <TextField
              id="whatsapp"
              label="رقم واتساب"
              placeholder="+97059..."
              inputMode="tel"
              dir="ltr"
              className="text-left"
              error={errors.whatsapp?.message}
              {...register("whatsapp")}
            />
          </div>

          <RegionSelector
            value={region}
            error={errors.region?.message}
            onChange={(value) =>
              setValue("region", value, { shouldDirty: true, shouldValidate: true })
            }
          />

          {isProvider ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  id="title"
                  label="العنوان المهني"
                  placeholder="مثلاً: مصمم جرافيك"
                  error={errors.title?.message}
                  {...register("title")}
                />
                <WorkModeSelector
                  value={workMode}
                  error={errors.workMode?.message}
                  onChange={(value) =>
                    setValue("workMode", value, { shouldDirty: true, shouldValidate: true })
                  }
                />
              </div>

              <TextAreaField
                id="bio"
                label="نبذة تعريفية"
                placeholder="اكتب نبذة قصيرة عن خبرتك والخدمات التي تقدمها"
                error={errors.bio?.message}
                {...register("bio")}
              />

              <label className="flex min-h-11 items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                <span>متاح للعمل</span>
                <input
                  type="checkbox"
                  className="size-5 accent-primary"
                  {...register("isAvailable")}
                />
              </label>

              <SkillsSelector
                skills={data.skills}
                selectedSkillIds={selectedSkillIds}
                error={errors.skills?.message}
                onChange={(skillIds) =>
                  setValue("skills", skillIds, { shouldDirty: true, shouldValidate: true })
                }
              />

              <PortfolioLinksEditor
                values={portfolioUrls}
                error={getPortfolioError(errors.portfolioUrls)}
                onChange={(urls) =>
                  setValue("portfolioUrls", urls, { shouldDirty: true, shouldValidate: true })
                }
              />
            </>
          ) : null}
        </CardContent>
      </Card>

      <div className="sticky bottom-20 z-10 flex justify-end rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur md:bottom-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>
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

function TextAreaField({
  id,
  label,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  error?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
        className="min-h-32 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm leading-7 transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function getPortfolioError(error: unknown) {
  if (!error) {
    return undefined;
  }

  if (typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return "تحقق من روابط الأعمال";
}
