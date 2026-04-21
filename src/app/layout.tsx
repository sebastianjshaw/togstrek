import type { Metadata, Viewport } from "next";
import { DM_Sans, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { TogstrekGoogleAnalytics } from "@/components/togstrek-google-analytics";
import { TogstrekThemeInitScript } from "@/components/togstrek-theme-init-script";
import { TogstrekJsonLd } from "@/components/togstrek-seo/togstrek-json-ld";
import { TogstrekSiteFooter } from "@/components/togstrek-site-footer";
import { TogstrekSiteHeader } from "@/components/togstrek-site-header";
import { TogstrekSkipLink } from "@/components/togstrek-skip-link";
import { getTogstrekMediaBaseUrl } from "@/config/togstrek-media";
import { togstrekLayoutJsonLdGraph } from "@/lib/togstrek-json-ld";
import {
  getTogstrekDefaultSocialOgImage,
  TOGSTREK_SITE_NAME,
} from "@/lib/togstrek-metadata";
import { getTogstrekSiteOrigin } from "@/lib/togstrek-site-url";

const fontDisplay = Space_Grotesk({
  variable: "--font-tt-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const fontDmSans = DM_Sans({
  variable: "--font-tt-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fontGeistMono = Geist_Mono({
  variable: "--font-tt-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: {
    default: "A Tog's Trek",
    template: "%s · A Tog's Trek",
  },
  description:
    "Personal travel photography and stories — countries, places, trails, and what happened before and after the shutter. Field notes from A Tog's Trek.",
  metadataBase: new URL(getTogstrekSiteOrigin()),
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    siteName: TOGSTREK_SITE_NAME,
    title: "A Tog's Trek",
    description:
      "Photo essays and travel notes from a photographer: regions, cities, hikes, and family trips — with the pictures to prove it.",
    locale: "en_GB",
    type: "website",
    images: [getTogstrekDefaultSocialOgImage()],
  },
  alternates: {
    types: {
      "application/rss+xml": `${getTogstrekSiteOrigin().replace(/\/+$/, "")}/feed.xml`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const mediaOrigin = getTogstrekMediaBaseUrl();

  return (
    <html
      lang="en-GB"
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontDmSans.variable} ${fontGeistMono.variable} h-full antialiased`}
    >
      <head>
        <TogstrekThemeInitScript />
        <link rel="preconnect" href={mediaOrigin} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={mediaOrigin} />
        <link
          rel="preconnect"
          href="https://images.unsplash.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-full min-w-0 flex-col overflow-x-clip font-tt-body">
        <TogstrekJsonLd data={togstrekLayoutJsonLdGraph()} />
        <TogstrekSkipLink />
        <TogstrekSiteHeader />
        {/* Single <main> per route lives in page templates; wrapper is for skip-link target only. */}
        <div
          id="togstrek-main"
          data-pagefind-body
          className="flex min-h-0 min-w-0 flex-1 flex-col"
          tabIndex={-1}
        >
          {children}
        </div>
        <TogstrekSiteFooter />
        <TogstrekGoogleAnalytics />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
