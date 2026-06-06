"use client";

/* eslint-disable @next/next/no-img-element */

import { Camera, Loader2, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { formatFileSize } from "@/lib/imageCompression";
import { uploadAvatarImage, uploadListingImage } from "@/lib/upload-image";
import { cn } from "@/lib/utils";

type UploadFolder = "listings" | "avatars" | "messages";

type UploadPreview = {
  id: string;
  previewUrl: string;
  size: number;
};

type ImageUploaderProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  folder: UploadFolder;
  disabled?: boolean;
};

export function ImageUploader({
  value = [],
  onChange,
  maxImages = 5,
  folder,
  disabled = false,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previews, setPreviews] = useState<UploadPreview[]>([]);
  const canAddMore = value.length + previews.length < maxImages;

  const uploadFile = useCallback(
    async (file: File) => {
      if (folder === "avatars") {
        return uploadAvatarImage(file);
      }

      return uploadListingImage(file);
    },
    [folder],
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remainingSlots = maxImages - value.length - previews.length;

      if (remainingSlots <= 0) {
        toast.error(`الحد الأقصى ${maxImages} صور`);
        return;
      }

      const selectedFiles = fileArray.slice(0, remainingSlots);

      if (fileArray.length > remainingSlots) {
        toast.info(`تم اختيار أول ${remainingSlots} صور فقط`);
      }

      setIsUploading(true);
      const uploadedUrls: string[] = [];

      for (const file of selectedFiles) {
        const previewUrl = URL.createObjectURL(file);
        const preview: UploadPreview = {
          id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
          previewUrl,
          size: file.size,
        };

        setPreviews((current) => [...current, preview]);

        try {
          const uploadedUrl = await uploadFile(file);
          uploadedUrls.push(uploadedUrl);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "تعذر رفع الصورة، حاول مرة أخرى");
        } finally {
          setPreviews((current) => current.filter((item) => item.id !== preview.id));
          URL.revokeObjectURL(previewUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...value, ...uploadedUrls].slice(0, maxImages));
        toast.success(`تم رفع ${uploadedUrls.length} صورة بنجاح`);
      }

      setIsUploading(false);
    },
    [maxImages, onChange, previews.length, uploadFile, value],
  );

  const removeImage = useCallback(
    (index: number) => {
      onChange(value.filter((_, currentIndex) => currentIndex !== index));
    },
    [onChange, value],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">صور العنصر</span>
        <span className="text-xs text-slate-500">
          {value.length + previews.length}/{maxImages}
        </span>
      </div>

      {canAddMore && !disabled ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragOver(false);
            void handleFiles(event.dataTransfer.files);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          disabled={isUploading}
          className={cn(
            "flex min-h-32 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-4 py-6 text-center transition",
            isDragOver
              ? "border-primary bg-primary/10"
              : "border-slate-300 bg-slate-50 hover:border-primary/60 hover:bg-primary/5",
            isUploading && "cursor-wait opacity-70",
          )}
        >
          {isUploading ? <Loader2 className="size-6 animate-spin text-primary" /> : <Camera className="size-6 text-primary" />}
          <div>
            <p className="text-sm font-bold text-slate-800">
              {isUploading ? "جاري رفع الصور..." : "اضغط لإضافة صور أو اسحبها هنا"}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              JPG أو PNG أو WebP، حتى {maxImages} صور. يتم ضغط الصور تلقائياً قبل الرفع.
            </p>
          </div>
        </button>
      ) : null}

      {value.length > 0 || previews.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500">معاينة الصور قبل النشر</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {value.map((url, index) => (
              <div key={`${url}-${index}`} className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <img
                  src={url}
                  alt={`صورة ${index + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {index === 0 ? (
                  <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                    رئيسية
                  </span>
                ) : null}
                {!disabled ? (
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute left-2 top-2 inline-flex size-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition hover:bg-red-50 hover:text-red-600"
                    aria-label="حذف الصورة"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
              </div>
            ))}

            {previews.map((preview) => (
              <div key={preview.id} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <img
                  src={preview.previewUrl}
                  alt="جاري رفع الصورة"
                  className="h-full w-full object-cover opacity-50"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/25 text-white">
                  <Loader2 className="size-6 animate-spin" />
                  <span className="text-xs">{formatFileSize(preview.size)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        disabled={disabled || isUploading || !canAddMore}
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);
          event.currentTarget.value = "";

          if (files.length > 0) {
            void handleFiles(files);
          }
        }}
      />

      <p className="text-xs text-slate-400">الصورة الأولى ستكون الصورة الرئيسية للعنصر.</p>
    </div>
  );
}
