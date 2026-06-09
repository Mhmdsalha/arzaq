import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const lenos = localFont({
  src: [
    {
      path: "../../public/fonts/Lenos-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lenos-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-primary",
  display: "swap",
});

export const metadata: Metadata = {
  title: "لولو | متجر أطفال",
  description: "متجر عربي تجريبي لملابس وألعاب الأطفال مستوحى من تصميم Stitch.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={lenos.variable}>
        <CartProvider>
          <Header />
          {children}
          <Footer />
          <div className="portfolio-badge">معرض أعمال - تصميم تجريبي</div>
        </CartProvider>
      </body>
    </html>
  );
}
