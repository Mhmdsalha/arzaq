import { ShoppingBag } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export function EmptyCart() {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <ShoppingBag size={42} />
      </div>
      <h1 className="page-title">سلتك فارغة</h1>
      <p className="muted">اكتشف منتجاتنا للأطفال وأضف أول قطعة تحبها.</p>
      <PrimaryButton href="/">متابعة التسوق</PrimaryButton>
    </div>
  );
}
