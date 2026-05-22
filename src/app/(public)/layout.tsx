import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicNavbar } from "@/components/layout/public-navbar";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-50 pb-16 md:pb-0">
      <PublicNavbar />
      {children}
      <PublicFooter />
      <MobileBottomNav />
    </div>
  );
}
