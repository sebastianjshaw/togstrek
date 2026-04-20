/**
 * Other Work hub (`/other-work`) — portfolio tiles + featured list.
 * Mirrors Squarespace “portfolio grid overlay” (compact tiles, 4∶3), not full-width MDX figures.
 */

const M = "https://media.togstrek.com";

export type TogstrekOtherWorkHubSection = {
  href: string;
  label: string;
  imageSrc: string;
  imageAlt: string;
};

export type TogstrekOtherWorkHubFeatured = {
  href: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  date: string;
};

/** Main collection tiles — same order as legacy Squarespace hub. */
export const togstrekOtherWorkHubSections: TogstrekOtherWorkHubSection[] = [
  {
    href: "/other-work/art-nude",
    label: "Art Nude",
    imageSrc: `${M}/other-work/art-nude/20121017-20121017-_js_7359jpg_8334220349_o-.jpg`,
    imageAlt: "Art Nude",
  },
  {
    href: "/other-work/astrophotography",
    label: "Astro",
    imageSrc: `${M}/other-work/astrophotography/Moon2.jpg`,
    imageAlt: "Astrophotography",
  },
  {
    href: "/other-work/avalon",
    label: "Avalon",
    imageSrc: `${M}/other-work/avalon/20241012-20241012+-+Avalon-5831-0005.jpg`,
    imageAlt: "Avalon",
  },
  {
    href: "/other-work/events",
    label: "Events",
    imageSrc: `${M}/other-work/events/20150810-IMG_3642-23-39-16.jpg`,
    imageAlt: "Events",
  },
  {
    href: "/other-work/fetish",
    label: "Fetish",
    imageSrc: `${M}/other-work/fetish/20090606-20090606-dsc00777_3612027502_o-.jpg`,
    imageAlt: "Fetish",
  },
  {
    href: "/other-work/photography-guides",
    label: "Guides",
    imageSrc: `${M}/other-work/photography-guides/LongestNight-4.jpg`,
    imageAlt: "Guides",
  },
  {
    href: "/other-work/misc",
    label: "Misc",
    imageSrc: `${M}/other-work/misc/misc.jpg`,
    imageAlt: "Misc",
  },
  {
    href: "/other-work/models",
    label: "Models & Fashion",
    imageSrc: `${M}/other-work/models/ella-de-vine/20101121-_JS_4063-406343a3.webp`,
    imageAlt: "Ella De Vine — studio portrait, Models & Fashion",
  },
  {
    href: "/other-work/music",
    label: "Music",
    imageSrc: `${M}/other-work/music/20211031-5DM33876-33876.jpg`,
    imageAlt: "Music",
  },
  {
    href: "/other-work/street-photography",
    label: "Street Photography",
    imageSrc: `${M}/other-work/street-photography/20120204+-+Wandering+Around+London-20120204-0001.jpg`,
    imageAlt: "Street Photography",
  },
];

/** Summary block “Featured” — links to photo essays under `/photography/…`. */
export const togstrekOtherWorkHubFeatured: TogstrekOtherWorkHubFeatured[] = [
  {
    href: "/photography/avalon/avalon-winter-is-coming",
    title: "Avalon | Winter is Coming",
    imageSrc: `${M}/other-work/_hub/20241116_143745.jpg`,
    imageAlt: "Avalon | Winter is Coming",
    date: "2024-11-16",
  },
  {
    href: "/photography/avalon/avalon-tree-planting",
    title: "Avalon | Tree Planting",
    imageSrc: `${M}/other-work/_hub/20241019_145045.jpg`,
    imageAlt: "Avalon | Tree Planting",
    date: "2024-10-19",
  },
  {
    href: "/photography/avalon/day-1-and-land-tour",
    title: "Avalon | Land tour",
    imageSrc: `${M}/other-work/_hub/20241012-20241012+-+Avalon-5829-0004.jpg`,
    imageAlt: "Avalon | Land tour",
    date: "2024-10-12",
  },
  {
    href: "/photography/avalon/avalon-day-1",
    title: "Avalon | Day 1",
    imageSrc: `${M}/other-work/_hub/20241010_182545.jpg`,
    imageAlt: "Avalon | Day 1",
    date: "2024-10-10",
  },
  {
    href: "/photography/avalon/avalon-family-tour",
    title: "Avalon | Family Tour",
    imageSrc: `${M}/other-work/_hub/20241010_181938.jpg`,
    imageAlt: "Avalon | Family Tour",
    date: "2024-09-28",
  },
  {
    href: "/photography/avalon/avalon-meeting-the-owner",
    title: "Avalon | Meeting the Owner",
    imageSrc: `${M}/other-work/_hub/20240920_151356.jpg`,
    imageAlt: "Avalon | Meeting the Owner",
    date: "2024-09-20",
  },
  {
    href: "/photography/avalon/avalon-visit-2",
    title: "Avalon | Visit 2",
    imageSrc: `${M}/other-work/_hub/20240907_145028.jpg`,
    imageAlt: "Avalon | Visit 2",
    date: "2024-09-07",
  },
  {
    href: "/photography/avalon/avalon-visit-1",
    title: "Avalon | Visit 1",
    imageSrc: `${M}/other-work/_hub/20240831_153204.jpg`,
    imageAlt: "Avalon | Visit 1",
    date: "2024-08-31",
  },
  {
    href: "/photography/music/the-eras-tour",
    title: "The Eras Tour",
    imageSrc: `${M}/other-work/_hub/20240519-03+Red-20240519_201101.jpg`,
    imageAlt: "The Eras Tour",
    date: "2024-05-18",
  },
  {
    href: "/photography/events/goteborgsvarvet-2024",
    title: "Göteborgsvarvet 2024",
    imageSrc: `${M}/other-work/_hub/20240518-20240518+-+Göteborgsvarvet-7398-0008.jpg`,
    imageAlt: "Göteborgsvarvet 2024",
    date: "2024-05-18",
  },
  {
    href: "/photography/events/meeting-merlin",
    title: "Meeting Merlin",
    imageSrc: `${M}/other-work/_hub/WhatsApp+Image+2023-07-26+at+17.12.29.jpg`,
    imageAlt: "Meeting Merlin",
    date: "2023-07-26",
  },
  {
    href: "/photography/explosion-at-sejdeln",
    title: "Explosion at Sejdeln",
    imageSrc: `${M}/other-work/_hub/20230710-20230710-003A0512-2.jpg`,
    imageAlt: "Explosion at Sejdeln",
    date: "2023-07-11",
  },
  {
    href: "/photography/music/oppet-hus-creative-spaces",
    title: "Öppet Hus @ Creative Spaces",
    imageSrc: `${M}/other-work/_hub/Linnea+of+Day+Felis-20230617-0001.jpg`,
    imageAlt: "Öppet Hus @ Creative Spaces",
    date: "2023-06-17",
  },
  {
    href: "/photography/events/vi-som-alskar-90-amp-00-talet-2022",
    title: "Vi som älskar 90 & 00-talet 2022",
    imageSrc: `${M}/other-work/_hub/20220702-20220702_133246.jpg`,
    imageAlt: "Vi som älskar 90 & 00-talet 2022",
    date: "2022-07-02",
  },
  {
    href: "/photography/events/capturing-the-music",
    title: "Capturing the Music",
    imageSrc: `${M}/other-work/_hub/db1b3238f1603568.jpg`,
    imageAlt: "Capturing the Music",
    date: "2022-02-16",
  },
  {
    href: "/photography/misc/forest-pumpkins",
    title: "Forest Pumpkins",
    imageSrc: `${M}/other-work/_hub/DxO-0005.jpg`,
    imageAlt: "Forest Pumpkins",
    date: "2021-12-31",
  },
  {
    href: "/photography/misc/new-forest-animals",
    title: "New Forest Animals",
    imageSrc: `${M}/other-work/_hub/DxO-0001-2.jpg`,
    imageAlt: "New Forest Animals",
    date: "2021-12-28",
  },
  {
    href: "/photography/astrophotography/handheld-moonshot-with-an-r5",
    title: "Handheld moonshot with an R5",
    imageSrc: `${M}/other-work/_hub/Moon1.jpg`,
    imageAlt: "Handheld moonshot with an R5",
    date: "2021-12-20",
  },
  {
    href: "/photography/misc/canon-r5",
    title: "Canon R5",
    imageSrc: `${M}/other-work/_hub/20211218-0007-2.jpg`,
    imageAlt: "Canon R5",
    date: "2021-12-18",
  },
  {
    href: "/photography/music/klass-ii-boy-with-apple",
    title: "KLASS II + BOY WITH APPLE 31/10",
    imageSrc: `${M}/other-work/_hub/20211031-5DM33876-33876.jpg`,
    imageAlt: "KLASS II + BOY WITH APPLE 31/10",
    date: "2021-11-01",
  },
  {
    href: "/photography/music/sounds-of-gothenburg-1",
    title: "Sounds of Gothenburg #1",
    imageSrc: `${M}/other-work/_hub/20210710-_JS_9458-9458.jpg`,
    imageAlt: "Sounds of Gothenburg #1",
    date: "2021-07-11",
  },
  {
    href: "/photography/events/driving-protest-for-palestine",
    title: "Driving protest for Palestine",
    imageSrc: `${M}/other-work/_hub/20210515-0002.jpg`,
    imageAlt: "Driving protest for Palestine",
    date: "2021-05-15",
  },
  {
    href: "/photography/misc/christmas-day-in-slottskogen",
    title: "Christmas Day in Slottskogen",
    imageSrc: `${M}/other-work/_hub/20201225-0001.jpg`,
    imageAlt: "Christmas Day in Slottskogen",
    date: "2020-12-25",
  },
  {
    href: "/photography/astrophotography/more-of-the-moon",
    title: "More of the Moon",
    imageSrc: `${M}/other-work/_hub/20201224+-+Moon-0002.jpg`,
    imageAlt: "More of the Moon",
    date: "2020-12-24",
  },
  {
    href: "/photography/misc/christmas-eve-at-gteborgs-botaniska-trdgrd",
    title: "Christmas Eve at Göteborgs Botaniska Trädgård",
    imageSrc: `${M}/other-work/_hub/20201224-0005.jpg`,
    imageAlt: "Christmas Eve at Göteborgs Botaniska Trädgård",
    date: "2020-12-24",
  },
  {
    href: "/photography/astrophotography/hand-held-moon-shots",
    title: "Hand Held Moon Shots",
    imageSrc: `${M}/other-work/_hub/20201222-0002.jpg`,
    imageAlt: "Hand Held Moon Shots",
    date: "2020-12-22",
  },
  {
    href: "/photography/events/motorcycle-santas",
    title: "Motorcycle Santas",
    imageSrc: `${M}/other-work/_hub/20201213+-+Motorcycle+Santas-0001.jpg`,
    imageAlt: "Motorcycle Santas",
    date: "2020-12-13",
  },
  {
    href: "/photography/events/gothenburgs-protest-for-george-floyd",
    title: "Gothenburg’s protest for George Floyd",
    imageSrc: `${M}/other-work/_hub/20200607+-+Black+Lives+Matter+Protest-0002-2.jpg`,
    imageAlt: "Gothenburg’s protest for George Floyd",
    date: "2020-06-07",
  },
  {
    href: "/photography/misc/baby-alg",
    title: "Baby Älg",
    imageSrc: `${M}/other-work/_hub/20200520-0001.jpg`,
    imageAlt: "Baby Älg",
    date: "2020-05-20",
  },
  {
    href: "/photography/events/oscar-fredriks-kammarkr",
    title: "Oscar Fredriks Kammarkör",
    imageSrc: `${M}/other-work/_hub/20201220-0002.jpg`,
    imageAlt: "Oscar Fredriks Kammarkör",
    date: "2020-03-20",
  },
];
