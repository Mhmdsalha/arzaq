import Link from "next/link";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h3 className="logo" style={{ color: "#acc7ff" }}>
            لولو
          </h3>
          <p style={{ color: "#cfdaf2", lineHeight: 1.9 }}>لأن كل طفل يستحق الأفضل، نصمم تجربة تسوق ناعمة وآمنة ومبهجة للعائلة.</p>
        </div>
        <div>
          <h4>روابط</h4>
          <ul>
            <li>
              <Link href="/category/girls">بنات</Link>
            </li>
            <li>
              <Link href="/category/boys">أولاد</Link>
            </li>
            <li>
              <Link href="/category/toys">ألعاب</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4>خدمة العملاء</h4>
          <ul>
            <li>الشحن والإرجاع</li>
            <li>دليل المقاسات</li>
            <li>الأسئلة الشائعة</li>
          </ul>
        </div>
        <div>
          <h4>النشرة</h4>
          <div className="newsletter">
            <input aria-label="البريد الإلكتروني" placeholder="بريدك الإلكتروني" />
            <PrimaryButton>اشتراك</PrimaryButton>
          </div>
        </div>
      </div>
      <div className="container" style={{ color: "#cfdaf2", marginTop: "2rem", fontSize: "0.9rem" }}>
        تصميم تجريبي مستوحى من مشروع Stitch رقم 9668317810268115180.
      </div>
    </footer>
  );
}
