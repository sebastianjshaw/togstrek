import type { Metadata } from "next";

import { TogstrekPhotographyHubPage } from "@/components/togstrek-photography/togstrek-photography-hub-page";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildTogstrekMetadata({
    title: "Photography",
    description:
      "Photo essays and event coverage — longer-form photography from Togstrek.",
    path: "/photography",
    type: "website",
  });
}

export default function TogstrekPhotographyIndexPage() {
  return <TogstrekPhotographyHubPage />;
}
