import type { Metadata, Viewport } from "next";
import { DM_Sans, Geist_Mono, Syne } from "next/font/google";
import "./globals.css";
import { TogstrekSiteHeader } from "@/components/togstrek-site-header";
import { TogstrekSkipLink } from "@/components/togstrek-skip-link";

const fontSyne = Syne({
  variable: "--font-tt-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
    "The most exciting journey is the next one… Curious travel guides and photo essays that dig deeper into countries, cities, and hikes.",
  metadataBase: new URL("https://togstrek.com"),
  openGraph: {
    title: "A Tog's Trek",
    description:
      "Curious travel guides and photo essays — countries, cities, hikes, and the stories behind the frame.",
    locale: "en_GB",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${fontSyne.variable} ${fontDmSans.variable} ${fontGeistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full min-w-0 flex-col overflow-x-clip font-tt-body">
        <TogstrekSkipLink />
        <TogstrekSiteHeader />
        <div
          id="togstrek-main"
          className="flex min-h-0 min-w-0 flex-1 flex-col"
          tabIndex={-1}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
