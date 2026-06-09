"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Medal, ShieldCheck, Sparkles, Truck } from "lucide-react";
import Image from "next/image";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-orb hero-orb-primary" />
      <div className="hero-orb hero-orb-secondary" />
      <div className="container hero-grid">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, x: 42 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="eyebrow">
            <Sparkles size={18} />
            وجهتكم الأولى لمنتجات الأطفال الراقية
          </span>
          <h1>
            كل ما يحتاجه طفلك
            <span>في مكان واحد</span>
          </h1>
          <p>
            اكتشفوا عالما من الأناقة والمرح مع تشكيلتنا المختارة بعناية من ملابس الأطفال، الألعاب التعليمية،
            والإكسسوارات العصرية.
          </p>
          <div className="hero-actions">
            <PrimaryButton href="/category/girls">
              تسوق الآن
              <ArrowLeft size={18} />
            </PrimaryButton>
            <PrimaryButton href="/category/toys" variant="secondary">
              اكتشف المجموعات
            </PrimaryButton>
          </div>
          <div className="hero-chips">
            <span className="hero-chip">
              <Truck size={16} />
              توصيل سريع
            </span>
            <span className="hero-chip">
              <ShieldCheck size={16} />
              مواد آمنة 100%
            </span>
            <span className="hero-chip">تغليف هدايا</span>
          </div>
        </motion.div>

        <div className="hero-media">
          <div className="hero-blob-backdrop" />
          <Image
            src="/images/stitch/generated/hero-lolo-high-res.png"
            alt="طفلة سعيدة داخل متجر لولو للأطفال"
            fill
            quality={100}
            priority
            sizes="(max-width: 920px) 88vw, 42vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
          <motion.div
            className="floating-note floating-note-quality"
            animate={{ y: [0, -10, 0], rotate: [-1.5, 1.5, -1.5] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Medal size={26} />
            <div>
              <strong>جودة ممتازة</strong>
              <span>مواد آمنة 100%</span>
            </div>
          </motion.div>
          <motion.div
            className="floating-note floating-note-delivery"
            animate={{ y: [0, 10, 0], rotate: [1.5, -1.5, 1.5] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.35 }}
          >
            <Truck size={26} />
            <div>
              <strong>توصيل سريع</strong>
              <span>لكافة المناطق</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
