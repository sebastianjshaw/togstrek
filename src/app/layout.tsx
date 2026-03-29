import type { Metadata, Viewport } from "next";
import { DM_Sans, Geist_Mono, Syne } from "next/font/google";
import "./globals.css";
import { TogstrekJsonLd } from "@/components/togstrek-seo/togstrek-json-ld";
import { TogstrekSiteFooter } from "@/components/togstrek-site-footer";
import { TogstrekSiteHeader } from "@/components/togstrek-site-header";
import { TogstrekSkipLink } from "@/components/togstrek-skip-link";
import { getTogstrekMediaBaseUrl } from "@/config/togstrek-media";
import { togstrekLayoutJsonLdGraph } from "@/lib/togstrek-json-ld";

/** Display face only uses semibold (600), bold (700), extrabold (800) in components. */
const fontSyne = Syne({
  variable: "--font-tt-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
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
    "The most exciting journey is the next one… Curious travel guides and photo essays that go deeper into countries, places, hikes, and the stories behind the frame.",
  metadataBase: new URL("https://togstrek.com"),
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
    title: "A Tog's Trek",
    description:
      "Curious travel guides and photo essays — countries, places, hikes, and the stories behind the frame.",
    locale: "en_GB",
    type: "website",
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
      className={`${fontSyne.variable} ${fontDmSans.variable} ${fontGeistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href={mediaOrigin} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={mediaOrigin} />
        <link
          rel="preconnect"
          href="https://images.squarespace-cdn.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://static1.squarespace.com"
          crossOrigin="anonymous"
        />
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
        <div
          id="togstrek-main"
          className="flex min-h-0 min-w-0 flex-1 flex-col"
          tabIndex={-1}
        >
          {children}
        </div>
        <TogstrekSiteFooter />
      </body>
    </html>
  );
}
