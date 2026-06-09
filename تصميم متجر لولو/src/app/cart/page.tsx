"use client";

import Link from "next/link";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <main>
        <EmptyCart />
      </main>
    );
  }

  return (
    <main>
      <section className="section">
        <div className="container">
          <Link className="muted" href="/">
            ← متابعة التسوق
          </Link>
          <div className="section-heading" style={{ marginTop: "1rem" }}>
            <div>
              <h1 className="page-title">سلة لولو</h1>
              <p>راجع المنتجات قبل إتمام الطلب التجريبي.</p>
            </div>
          </div>
          <div className="cart-layout">
            <div className="cart-list">
              {items.map((item) => (
                <CartItem item={item} key={item.key} />
              ))}
            </div>
            <CartSummary />
          </div>
        </div>
      </section>
    </main>
  );
}
