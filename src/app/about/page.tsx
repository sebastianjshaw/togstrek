import type { Metadata } from "next";

import { TogstrekAboutPage } from "@/components/togstrek-about/togstrek-about-page";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";

const ABOUT_OG_IMAGE =
  "https://static1.squarespace.com/static/6207d70ece223e42dd9ae587/t/62430201c259e80324888871/1648558593135/IMG_4140.jpg?format=1500w";

export const metadata: Metadata = buildTogstrekMetadata({
  title: "About",
  description:
    "Who's behind Tog's Trek — a lifelong traveller's lens on exploration, photography, and the road from Gothenburg to everywhere else.",
  path: "/about",
  openGraphTitle: "About — A Tog's Trek",
  openGraphDescription:
    "Who's behind Tog's Trek — a lifelong traveller's lens on exploration, photography, and the road from Gothenburg to everywhere else.",
  openGraphImages: [
    {
      url: ABOUT_OG_IMAGE,
      width: 1500,
      height: 1000,
      alt: "Tog's Trek",
    },
  ],
});

export default function AboutRoutePage() {
  return <TogstrekAboutPage />;
}
