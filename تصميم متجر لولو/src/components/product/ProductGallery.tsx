"use client";

import { PlayCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const visibleImages = images.slice(0, 5);

  return (
    <div className="stitch-product-gallery">
      <div className="product-glow product-glow-primary" />
      <div className="product-glow product-glow-secondary" />
      <div className="image-box gallery-main stitch-main-image">
        <Image
          src={images[active]}
          alt={name}
          fill
          quality={100}
          priority
          sizes="(max-width: 920px) 92vw, 48vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div className="product-ribbons" aria-hidden="true">
          <span>جديد!</span>
          <span>خصم 25%</span>
        </div>
      </div>
      <div className="thumb-row stitch-thumb-row">
        {visibleImages.map((image, index) => (
          <button
            className={`image-box thumb stitch-thumb ${index === active ? "is-active" : ""}`}
            key={`${image}-${index}`}
            type="button"
            aria-label={`عرض صورة ${index + 1}`}
            onClick={() => setActive(index)}
          >
            <Image
              src={image}
              alt={`${name} ${index + 1}`}
              fill
              quality={100}
              sizes="90px"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
            {index === 4 ? (
              <span className="thumb-play" aria-hidden="true">
                <PlayCircle size={24} />
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
