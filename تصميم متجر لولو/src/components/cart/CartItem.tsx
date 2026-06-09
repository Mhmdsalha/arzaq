"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import type { CartLine } from "@/data/mock";
import { useCart } from "@/context/CartContext";

export function CartItem({ item }: { item: CartLine }) {
  const { removeItem, updateQuantity } = useCart();

  return (
    <article className="cart-item">
      <div className="image-box">
        <Image
          src={item.image}
          alt={item.name}
          fill
          quality={100}
          sizes="(max-width: 768px) 100vw, 25vw"
          style={{ objectFit: "cover", objectPosition: "top" }}
        />
      </div>
      <div>
        <h3 className="font-display" style={{ margin: "0 0 0.45rem", fontSize: "1.35rem" }}>
          {item.name}
        </h3>
        <p className="muted" style={{ margin: 0 }}>
          {item.ageRange} {item.size ? `- مقاس ${item.size}` : ""}
        </p>
        <div className="price-row">
          <span className="price">{item.price} ريال</span>
        </div>
      </div>
      <div className="cart-item-actions" style={{ display: "grid", gap: "0.7rem", justifyItems: "end" }}>
        <div className="quantity-row">
          <button className="quantity-button" type="button" onClick={() => updateQuantity(item.key, item.quantity - 1)}>
            <Minus size={16} />
          </button>
          <span className="quantity-button" style={{ display: "inline-grid", placeItems: "center" }}>
            {item.quantity}
          </span>
          <button className="quantity-button" type="button" onClick={() => updateQuantity(item.key, item.quantity + 1)}>
            <Plus size={16} />
          </button>
        </div>
        <button className="secondary-button" type="button" onClick={() => removeItem(item.key)}>
          <Trash2 size={16} />
          حذف
        </button>
      </div>
    </article>
  );
}
