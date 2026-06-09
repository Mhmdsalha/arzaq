import { CreditCard, RefreshCw, ShieldCheck, Truck } from "lucide-react";

const items = [
  { label: "توصيل سريع", icon: Truck },
  { label: "منتجات آمنة للأطفال", icon: ShieldCheck },
  { label: "إرجاع مجاني", icon: RefreshCw },
  { label: "دفع آمن", icon: CreditCard },
];

export function TrustBar() {
  return (
    <section className="section">
      <div className="container trust-grid">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div className="trust-item" key={item.label}>
              <Icon color="#4f8ef7" size={22} />
              <span style={{ display: "block", marginTop: "0.55rem" }}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
