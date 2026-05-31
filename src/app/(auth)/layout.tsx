import { createPageMetadata } from "@/lib/seo";
import { AuthFormWrapper } from "@/components/auth/AuthFormWrapper";
import { GreenMarketingPanel } from "@/components/auth/GreenMarketingPanel";

export const metadata = createPageMetadata({
  title: "الدخول إلى أرزاق",
  description: "صفحات تسجيل الدخول وإنشاء الحساب في منصة أرزاق.",
  path: "/auth/login",
  noIndex: true,
});

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="h-[100svh] overflow-hidden bg-white">
      <div className="flex h-full flex-row">
        <section className="ios-momentum w-full overflow-y-auto bg-white lg:w-1/2">
          <div className="flex h-32 items-center justify-center rounded-b-3xl bg-[linear-gradient(135deg,#15803d,#16a34a,#22c55e)] lg:hidden">
            <div className="text-center text-white">
              <p className="font-palestine text-4xl font-bold">أرزاق</p>
              <p className="text-sm text-white/80">معاً نبـــــني الفرص</p>
            </div>
          </div>
          <AuthFormWrapper>{children}</AuthFormWrapper>
        </section>

        <section className="hidden lg:flex lg:w-1/2">
          <GreenMarketingPanel />
        </section>
      </div>
    </main>
  );
}
