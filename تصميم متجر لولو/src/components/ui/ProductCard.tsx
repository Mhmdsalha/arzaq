"use client";

import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/mock";
import { useCart } from "@/context/CartContext";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { addItem } = useCart();

  return (
    <motion.article
      className="product-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45 }}
    >
      <button className="wishlist-button" aria-label={`إضافة ${product.name} للمفضلة`}>
        <Heart size={18} />
      </button>
      <Link href={`/product/${product.id}`} aria-label={product.name}>
        <div className="image-box product-image">
          <Image
            src={product.image}
            alt={product.name}
            fill
            quality={100}
            priority={priority}
            sizes="(max-width: 768px) 100vw, 25vw"
            style={{ objectFit: "cover", objectPosition: "top" }}
          />
        </div>
      </Link>
      <div className="product-meta" style={{ marginTop: "0.85rem" }}>
        <span className="pill">{product.ageRange}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
          <Star size={15} fill="#ffb84d" color="#ffb84d" />
          {product.rating}
        </span>
      </div>
      <Link href={`/product/${product.id}`}>
        <h3>{product.name}</h3>
      </Link>
      <div className="product-meta">
        <span>{product.categoryLabel}</span>
        <span>{product.badge}</span>
      </div>
      <div className="price-row">
        <span className="price">{product.price} ر.س</span>
        <span className="old-price">{product.originalPrice} ر.س</span>
      </div>
      <button className="primary-button" style={{ width: "100%" }} type="button" onClick={() => addItem(product)}>
        <ShoppingBag size={18} />
        أضف للسلة
      </button>
    </motion.article>
  );
}
