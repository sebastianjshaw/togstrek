import type { Metadata } from "next";

import {
  discoverTogstrekPlaceDivisionLeafStaticParams,
  generateTogstrekPlaceRouteMetadata,
  TogstrekPlaceAppRoute,
  type TogstrekPlaceDivisionLeafStaticParams,
} from "@/lib/togstrek-place-app-route";

type PageParams = TogstrekPlaceDivisionLeafStaticParams;

/** Only prebuilt place paths — blocks traversal attempts on dynamic hosts. */
export const dynamicParams = false;

export async function generateStaticParams(): Promise<PageParams[]> {
  return discoverTogstrekPlaceDivisionLeafStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { continent, country, division } = await params;
  return generateTogstrekPlaceRouteMetadata(continent, country, [division]);
}

export default async function TogstrekPlaceDivisionLeafPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { continent, country, division } = await params;
  return (
    <TogstrekPlaceAppRoute
      continent={continent}
      country={country}
      place={[division]}
    />
  );
}
