"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

const banners = [
  {
    src: "/images/stitch/generated/banner-autumn-child.png",
    alt: "تشكيلة الخريف الجديدة",
    label: "جديد",
    title: "تشكيلة الخريف الجديدة",
    text: "ألوان دافئة وتصاميم مريحة تناسب أجواء الخريف الساحرة.",
    align: "start",
    button: "تسوق التشكيلة الآن",
  },
  {
    src: "/images/stitch/generated/banner-back-to-school-room.png",
    alt: "العودة للمدارس",
    title: "العودة للمدارس",
    text: "تشكيلة مميزة من الحقائب المدرسية والمستلزمات الدراسية عالية الجودة.",
    align: "end",
    button: "تسوق التشكيلة",
  },
  {
    src: "/images/stitch/generated/banner-toy-playroom.png",
    alt: "تخفيضات كبرى",
    title: "تخفيضات كبرى",
    text: "خصومات تصل إلى ٥٠٪ على تشكيلة مختارة.",
    align: "center",
    button: "تسوق العروض",
  },
];

export function PromoSection() {
  return (
    <section className="section promo-stack">
      <div className="container">
        {banners.map((banner, index) => (
          <motion.div
            className={`stitch-banner stitch-banner-${banner.align}`}
            key={banner.src}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
          >
            <Image
              src={banner.src}
              alt={banner.alt}
              fill
              quality={100}
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
            <div className="banner-overlay">
              {banner.label ? <span>{banner.label}</span> : null}
              <h2>{banner.title}</h2>
              <p>{banner.text}</p>
              <PrimaryButton href="/category/accessories" variant={banner.align === "end" ? "secondary" : "primary"}>
                {banner.button}
                <ArrowLeft size={18} />
              </PrimaryButton>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
