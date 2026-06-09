"use client";

import { LockKeyhole } from "lucide-react";
import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";

export function CartSummary() {
  const [promoApplied, setPromoApplied] = useState(false);
  const { totalPrice } = useCart();

  const totals = useMemo(() => {
    const discount = promoApplied ? totalPrice * 0.1 : 0;
    const taxable = Math.max(totalPrice - discount, 0);
    const tax = taxable * 0.15;
    return { discount, tax, total: taxable + tax };
  }, [promoApplied, totalPrice]);

  return (
    <aside className="summary-card">
      <h2 className="font-display" style={{ marginTop: 0 }}>
        ملخص الطلب
      </h2>
      <div className="summary-row">
        <span>المجموع الفرعي</span>
        <strong>{totalPrice.toFixed(0)} ريال</strong>
      </div>
      <div className="summary-row">
        <span>الشحن</span>
        <strong style={{ color: "#0d5c46" }}>مجاني</strong>
      </div>
      {promoApplied ? (
        <div className="summary-row">
          <span>خصم لولو</span>
          <strong style={{ color: "#0d5c46" }}>-{totals.discount.toFixed(0)} ريال</strong>
        </div>
      ) : null}
      <div className="summary-row">
        <span>الضريبة 15%</span>
        <strong>{totals.tax.toFixed(0)} ريال</strong>
      </div>
      <div className="summary-row total">
        <span>الإجمالي</span>
        <strong>{totals.total.toFixed(0)} ريال</strong>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", margin: "1rem 0" }}>
        <input className="promo-input" placeholder="كود الخصم" style={{ minWidth: 0, flex: 1 }} />
        <button className="secondary-button" type="button" onClick={() => setPromoApplied(true)}>
          تطبيق
        </button>
      </div>
      {promoApplied ? <p style={{ color: "#0d5c46", fontWeight: 900 }}>تم تطبيق خصم تجريبي بنجاح</p> : null}
      <button className="primary-button" style={{ width: "100%" }} type="button">
        إتمام الطلب
      </button>
      <p className="muted" style={{ textAlign: "center", display: "flex", justifyContent: "center", gap: "0.35rem" }}>
        <LockKeyhole size={16} />
        دفع آمن ومشفر
      </p>
      <p className="muted" style={{ textAlign: "center", fontWeight: 900 }}>
        مدى | Visa | Mastercard | Apple Pay | STC Pay
      </p>
    </aside>
  );
}
