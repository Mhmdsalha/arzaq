"use client";

import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function ListingGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [activeImage, setActiveImage] = useState(images[0] ?? null);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-green-50 text-primary-dark">
            <ShoppingBag className="size-16" />
          </div>
        )}
      </div>

      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.slice(0, 5).map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveImage(image)}
              className={cn(
                "relative size-20 shrink-0 overflow-hidden rounded-2xl border bg-slate-100 transition",
                activeImage === image ? "border-primary ring-2 ring-primary/20" : "border-slate-200",
              )}
              aria-label={`عرض الصورة ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${title} - صورة ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
