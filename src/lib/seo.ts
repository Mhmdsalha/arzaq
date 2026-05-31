import type { Metadata } from "next";

export const siteConfig = {
  name: "أرزاق",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  locale: "ar_PS",
  description:
    "أرزاق منصة عربية محلية في غزة لنشر طلبات العمل والخدمات، استقبال العروض، وبناء ملفات مهنية موثوقة لمقدمي الخدمات.",
  keywords: [
    "أرزاق",
    "خدمات في غزة",
    "طلبات عمل في غزة",
    "مقدمو خدمات غزة",
    "فرص عمل غزة",
    "عمل من البيت غزة",
    "مصممين غزة",
    "مبرمجين غزة",
    "مدرسين غزة",
    "سوق خدمات محلي",
  ],
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

export function createPageMetadata({
  title,
  description,
  path = "/",
  image = "/favicon.svg",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const pageDescription = description ?? siteConfig.description;

  return {
    title,
    description: pageDescription,
    keywords: siteConfig.keywords,
    alternates: {
      canonical: path,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title: title ? `${title} | ${siteConfig.name}` : siteConfig.name,
      description: pageDescription,
      url: absoluteUrl(path),
      images: [
        {
          url: absoluteUrl(image),
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: title ? `${title} | ${siteConfig.name}` : siteConfig.name,
      description: pageDescription,
      images: [absoluteUrl(image)],
    },
  };
}

export function truncateDescription(text: string, maxLength = 155) {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trim()}…`;
}
