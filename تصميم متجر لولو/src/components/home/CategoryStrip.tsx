"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/mock";

export function CategoryStrip() {
  return (
    <section className="section categories-section">
      <div className="container">
        <div className="section-heading centered-heading">
          <div>
            <span className="section-kicker">اكتشف مجموعاتنا</span>
            <h2>تسوق حسب الفئة</h2>
            <p>نقدم لكم تشكيلة مختارة بعناية من أرقى المنتجات التي تجمع بين الجودة العالية والتصميم العصري.</p>
          </div>
        </div>
        <motion.div className="category-strip" initial="hidden" whileInView="show" viewport={{ once: true }}>
          {categories.slice(0, 4).map((category, index) => (
            <motion.div
              key={category.slug}
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0, transition: { delay: index * 0.08 } },
              }}
            >
              <Link className={`category-card tone-${category.tone}`} href={`/category/${category.slug}`}>
                <div className="image-box">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    quality={100}
                    sizes="(max-width: 768px) 100vw, 25vw"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                  />
                </div>
                <div className="category-overlay">
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                  <span>←</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
