import type { Metadata } from "next";
import { Cairo, Tajawal } from "next/font/google";

import { RouteProgressBar } from "@/components/shared/RouteProgressBar";
import { auth } from "@/lib/auth";
import { absoluteUrl, createPageMetadata, siteConfig } from "@/lib/seo";
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

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: absoluteUrl("/"),
  inLanguage: "ar",
  description: siteConfig.description,
  potentialAction: {
    "@type": "SearchAction",
    target: `${absoluteUrl("/jobs")}?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "منصة العمل والخدمات المحلية في غزة",
    description: siteConfig.description,
    path: "/",
  }),
  applicationName: siteConfig.name,
  authors: [{ name: "فريق أرزاق", url: siteConfig.url }],
  creator: "أرزاق",
  publisher: "أرزاق",
  category: "marketplace",
  title: {
    default: "أرزاق | منصة العمل والخدمات المحلية في غزة",
    template: "%s | أرزاق",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL(siteConfig.url),
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
  other: {
    "theme-color": "#16a34a",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": siteConfig.name,
  },
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
          <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
          />
          <RouteProgressBar />
          <AppProviders>{children}</AppProviders>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
