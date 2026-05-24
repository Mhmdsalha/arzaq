"use client";

import { Camera, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { uploadAvatarImage } from "@/lib/upload-image";

export function AvatarUploader({
  avatarUrl,
  onUploaded,
}: {
  avatarUrl: string;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const displayUrl = previewUrl || avatarUrl;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleFile(file?: File) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار صورة صحيحة");
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
      }

      return nextPreviewUrl;
    });

    setIsUploading(true);

    try {
      const uploadedUrl = await uploadAvatarImage(file);
      onUploaded(uploadedUrl);
      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر رفع الصورة، حاول مرة أخرى");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative size-28 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-slate-500 transition-all hover:border-primary/50"
        aria-label="رفع صورة البروفايل"
      >
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt="صورة البروفايل"
            fill
            sizes="112px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="flex h-full items-center justify-center">
            <Camera className="size-8" />
          </span>
        )}
      </button>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-950">صورة البروفايل</p>
        <p className="max-w-md text-sm leading-6 text-slate-600">
          سيتم ضغط الصورة تلقائيًا قبل الرفع لتبقى خفيفة وسريعة على الاتصالات الضعيفة.
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {isUploading ? "جاري الرفع..." : "اختيار صورة"}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </div>
  );
}
