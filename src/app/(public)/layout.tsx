import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicNavbar } from "@/components/layout/public-navbar";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-[100svh] overflow-x-hidden bg-slate-50 pb-20 lg:pb-0">
      <PublicNavbar />
      {children}
      <PublicFooter />
      <MobileBottomNav />
    </div>
  );
}
