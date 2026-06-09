"use client";

import { Heart, Minus, Palette, Plus, Ruler, ShieldCheck, ShoppingBag, SmilePlus, Star } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import type { Product, Size } from "@/data/mock";

export function ProductInfo({ product }: { product: Product }) {
  const [size, setSize] = useState<Size>(product.sizes[1] ?? product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const addSelected = () => {
    for (let index = 0; index < quantity; index += 1) {
      addItem(product, size);
    }
  };

  return (
    <aside className="info-panel stitch-info-panel">
      <p className="product-path">{product.categoryLabel} ← لولو</p>
      <h1 className="stitch-product-title">{product.name}</h1>

      <div className="stitch-rating-row">
        <span className="stitch-stars" aria-label={`تقييم ${product.rating}`}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} size={18} fill="#ffb84d" color="#ffb84d" />
          ))}
        </span>
        <strong>{product.rating}</strong>
        <span className="review-link">({product.reviews} بطل صغير)</span>
        <span className="happy-pill">
          <SmilePlus size={16} />
          مناسب لعمر {product.ageRange}
        </span>
      </div>

      <div className="stitch-price-box">
        <span className="stitch-price">{product.price} ر.س</span>
        <span className="stitch-old-price">{product.originalPrice} ر.س</span>
        <span className="sale-chip">{product.badge}</span>
      </div>

      <p className="stitch-description">{product.description}</p>

      <div className="stitch-option-block">
        <strong>
          <Palette size={18} />
          اختر اللون
        </strong>
        <div className="stitch-color-row">
          {product.colors.map((color, index) => (
            <button
              className={`stitch-color ${index === 0 ? "is-active" : ""}`}
              key={color.value}
              type="button"
              title={color.name}
              aria-label={color.name}
              style={{ background: color.value }}
            />
          ))}
        </div>
      </div>

      <div className="stitch-option-block">
        <strong>
          <Ruler size={18} />
          {product.isToy ? "اختر النوع" : "اختر المقاس"}
        </strong>
        <div className="stitch-size-row">
          {product.sizes.map((item) => (
            <button
              className={`stitch-size ${item === size ? "is-active" : ""}`}
              key={item}
              type="button"
              onClick={() => setSize(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="stitch-action-row">
        <div className="stitch-qty" aria-label="الكمية">
          <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
            <Minus size={16} />
          </button>
          <span>{quantity}</span>
          <button type="button" onClick={() => setQuantity(quantity + 1)}>
            <Plus size={16} />
          </button>
        </div>
        <button className="stitch-add-button" type="button" onClick={addSelected}>
          <ShoppingBag size={20} />
          أضف إلى السلة
        </button>
        <button className="stitch-heart-button" type="button" aria-label="أضيفي للمفضلة">
          <Heart size={22} />
        </button>
      </div>

      <div className="stitch-trust-row">
        <span>
          <ShieldCheck size={18} />
          خامات آمنة ومعتمدة للأطفال
        </span>
        <span>إرجاع مجاني خلال 7 أيام</span>
      </div>

      <div className="mobile-sticky-bar">
        <button className="primary-button" type="button" onClick={addSelected}>
          أضف إلى السلة
        </button>
        <button className="secondary-button" type="button">
          المفضلة
        </button>
      </div>
    </aside>
  );
}
