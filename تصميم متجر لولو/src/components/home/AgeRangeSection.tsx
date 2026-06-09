"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ageRanges } from "@/data/mock";

export function AgeRangeSection() {
  return (
    <section className="section section-soft">
      <div className="container">
        <div className="section-heading">
          <div>
            <h2>تسوق حسب العمر</h2>
            <p>تصنيفات تساعدك تختار بسرعة حسب مرحلة الطفل.</p>
          </div>
        </div>
        <div className="age-grid">
          {ageRanges.map((range, index) => (
            <motion.div
              key={range.label}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <Link className={`age-card tone-${range.tone}`} href={range.href}>
                <div className="image-box">
                  <Image
                    src={range.image}
                    alt={range.label}
                    fill
                    quality={100}
                    sizes="(max-width: 768px) 100vw, 25vw"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                  />
                </div>
                <h3>{range.label}</h3>
                <p>منتجات مناسبة ومريحة لهذه المرحلة.</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
