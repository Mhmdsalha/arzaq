import type { Metadata } from "next";
import { Cairo, Tajawal } from "next/font/google";

import { RouteProgressBar } from "@/components/shared/RouteProgressBar";
import { auth } from "@/lib/auth";
import { AppProviders } from "@/providers/app-providers";
import { AuthSessionProvider } from "@/providers/SessionProvider";
import "@/styles/global.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "أرزاق",
    template: "%s | أرزاق",
  },
  description: "منصة عربية محلية لربط أصحاب الطلبات بمقدمي الخدمات في غزة.",
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${tajawal.variable} min-h-[100svh] overflow-x-hidden bg-background font-sans antialiased`}
      >
        <AuthSessionProvider session={session}>
          <RouteProgressBar />
          <AppProviders>{children}</AppProviders>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
