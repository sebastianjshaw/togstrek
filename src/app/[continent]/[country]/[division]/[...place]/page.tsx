import type { Metadata } from "next";

import {
  discoverTogstrekPlaceDivisionRouteStaticParams,
  generateTogstrekPlaceRouteMetadata,
  TogstrekPlaceAppRoute,
  type TogstrekPlaceDivisionRouteStaticParams,
} from "@/lib/togstrek-place-app-route";

type PageParams = TogstrekPlaceDivisionRouteStaticParams;

/** Only prebuilt place paths — blocks traversal attempts on dynamic hosts. */
export const dynamicParams = false;

export async function generateStaticParams(): Promise<PageParams[]> {
  return discoverTogstrekPlaceDivisionRouteStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { continent, country, division, place } = await params;
  return generateTogstrekPlaceRouteMetadata(continent, country, [
    division,
    ...place,
  ]);
}

export default async function TogstrekPlaceDivisionPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { continent, country, division, place } = await params;
  return (
    <TogstrekPlaceAppRoute
      continent={continent}
      country={country}
      place={[division, ...place]}
    />
  );
}
