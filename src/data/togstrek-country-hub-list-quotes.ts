/**
 * Country hub quotes: full quote + attribution on the country hub header
 * (`/{continent}/{country}`). Continent hub tiles use the saying only — see
 * `getTogstrekCountryHubTileQuote`.
 *
 * ISO2 entries are merged from the Squarespace backup via:
 * `npm run migrate:country-hub-quotes` (see `scripts/togstrek-migrate-country-hub-quotes.ts`).
 */

export type TogstrekCountryHubHeaderQuote = {
  body: string;
  attribution: string;
};

/**
 * Optional blockquote under the country hub title (`/{continent}/{country}`).
 * Keyed by ISO 3166-1 alpha-2.
 */
export const togstrekCountryHubHeaderQuoteByIso2: Partial<
  Record<string, TogstrekCountryHubHeaderQuote>
> = {
  AQ: {
    body: "Antarctica is otherworldly, like nothing I’ve ever seen before. Stark, cold, beautiful desolation.",
    attribution: "Mark Hoppus",
  },
  AR: {
    body: "We are Argentina. Who the opponent is doesn’t matter.",
    attribution: "Leo Messi",
  },
  AT: {
    body: "I really feel great in Austria, I love my home and Vienna is just the best place to be.",
    attribution: "Conchita Wurst",
  },
  AU: {
    body: "Australia is my lens. I can’t see the world any other way.- Peter Carey",
    attribution: "Peter Carey",
  },
  BA: {
    body: "I am hopeful that no one will forget what happened in Bosnia",
    attribution: "Fatos Nano",
  },
  BE: {
    body: "I grew up in Europe, where the history comes from.",
    attribution: "Eddie Izzard",
  },
  BG: {
    body: "Bulgaria is a fascinating, beautiful, difficult country, and I fell in love with it.- Garth Greenwell",
    attribution: "",
  },
  BJ: {
    body: "I dream of a Benin that smiles and that's why I invite us to turn resolutely toward a clear future.",
    attribution: "President Thomas Boni Yayi",
  },
  BZ: {
    body: "Belize is so raw and so clear and so in-your-face.",
    attribution: "John McAfee",
  },
  CH: {
    body: "It's tough to find a place not to like in Switzerland.",
    attribution: "Michele Bachmann",
  },
  CM: {
    body: "Cameroon is stronger because it's a country of conquerors, of winners.",
    attribution: "Roger Milla",
  },
  CO: {
    body: "In Colombia, we have a lot of passion.",
    attribution: "Maluma",
  },
  CR: {
    body: "Costa Rica seduced the young solo traveler me … with visions of tropical beaches, smoking volcanoes, abundant wildlife and friendly locals- Wendy Yanagihara",
    attribution: "Wendy Yanagihara",
  },
  CZ: {
    body: "The Czech Republic are coming from behind in more than one way now.",
    attribution: "John Motson",
  },
  DE: {
    body: "Germany has become a country that many people abroad associate with hope.",
    attribution: "Angela Merkel",
  },
  DK: {
    body: "Denmark is like a secret little place with its own special language.",
    attribution: "Helena Christensen",
  },
  DO: {
    body: "MOST EUROPEANS HAVE NO IDEA HOW WILD LIFE CAN BE IN NORTH AMERICA- Tom G. Palmer",
    attribution: "Tom G. Palmer",
  },
  EC: {
    body: "Anybody who's been to Ecuador wants to go back because it's beautiful out there.",
    attribution: "Michael Steger",
  },
  EE: {
    body: "Creating a new country from scratch has given Estonia the license to imagine what a country could be.",
    attribution: "Taavet Hinrikuseadley",
  },
  EG: {
    body: "Egypt is full of dreams, mysteries, memories.",
    attribution: "Janet Erskine Stuart",
  },
  ES: {
    body: "Barcelona is a great city and Spain is a great country to live in.",
    attribution: "Shakira",
  },
  FI: {
    body: "My favourite country is Finland because once you get to a certain point, you can drive for hours without seeing a single person",
    attribution: "Christopher Lee",
  },
  FR: {
    body: "I wanted to get far away from those who believed in cruelty, so then I went to France, a land of true freedom, democracy, equality and fraternity.- Josephine Baker",
    attribution: "Josephine Baker",
  },
  GB: {
    body: "The four home nations that make up our United Kingdom are bound together by historic links. We have, and always will be, better together.",
    attribution: "Alok Sharma",
  },
  GH: {
    body: "Ghana is a huge grindstone, and depending on what you are made of, can grind you down or polish you up.",
    attribution: "Alba Kunadu Sumprim",
  },
  GR: {
    body: "In many ways we are all sons and daughters of ancient Greece",
    attribution: "",
  },
  GT: {
    body: "MOST EUROPEANS HAVE NO IDEA HOW WILD LIFE CAN BE IN NORTH AMERICA- Tom G. Palmer",
    attribution: "Tom G. Palmer",
  },
  HK: {
    body: "Those of us lucky enough to fall in love with Asia know that it's an affair that's as long as it is resonant.",
    attribution: "",
  },
  HR: {
    body: "Croatia has been glorious - it's so beautiful, and I want to go back as often as I can.",
    attribution: "Emilia Clarke",
  },
  HU: {
    body: "In Hungary all native music, in its origin, is divided naturally into melody destined for song or melody for the dance.",
    attribution: "Franz Liszt",
  },
  IE: {
    body: "We may have bad weather in Ireland, but the sun shines in the hearts of the people and that keeps us all warm.",
    attribution: "Marianne Williamson",
  },
  IL: {
    body: "Israel changed my life. It is one of the most amazing countries that I have ever been to.- Frank Grillo",
    attribution: "",
  },
  IS: {
    body: "I would like to go to Iceland to see the northern lights.",
    attribution: "Art Malik",
  },
  IT: {
    body: "You may have the universe if I may have Italy.",
    attribution: "Giuseppe Verdi",
  },
  JO: {
    body: "Jordan has a strange, haunting beauty and a sense of timelessness.",
    attribution: "Hussein of Jordan",
  },
  KE: {
    body: "Kenya is an immense land with a capacity for healing.",
    attribution: "Yvonne Adhiambo Owuor",
  },
  LI: {
    body: "I grew up in Europe, where the history comes from.",
    attribution: "Eddie Izzard",
  },
  LT: {
    body: "And finally, the bald man joined in, singing out national anthem. 'Lithuania, land of heroes...",
    attribution: "Ruta Sepetys",
  },
  LV: {
    body: "Latvia!",
    attribution: "Neal Stephenson",
  },
  MA: {
    body: "In Morocco, it’s possible to see the Atlantic and the Mediterranean at the same time.- Tahar Ben Jelloun",
    attribution: "Tahar Ben Jelloun",
  },
  MC: {
    body: "I have found serenity at Monaco.",
    attribution: "Stephan El Shaarawy",
  },
  MT: {
    body: "Malta is the only country in the world where the local delicacy is the bread.",
    attribution: "",
  },
  MX: {
    body: "Mexico is a mosaic of different realities and beauties.",
    attribution: "Enrique Pena Nietoley",
  },
  MY: {
    body: "Malaysia is a country unlike any other: Full of promise and fragility. - Tariq Ramadan",
    attribution: "",
  },
  NG: {
    body: "Nigeria will shine again if we reason together as Nigerians",
    attribution: "Isa Ajiya",
  },
  NL: {
    body: "The whole territory of the Netherlands was girt with forests.- John Lothrop Motley",
    attribution: "",
  },
  NO: {
    body: "I want to travel. Maybe I'll end up living in Norway, making cakes.",
    attribution: "Eva Green",
  },
  NP: {
    body: "Nepal is wondrous. It is full of ancient stories and beautiful temples, not to mention the world’s most magnificent mountain range",
    attribution: "Peter Kuruvita",
  },
  PL: {
    body: "I grew up in Europe, where the history comes from.",
    attribution: "Eddie Izzard",
  },
  PS: {
    body: "I would like to go and dance in Palestine one day, with great pleasure, great pleasure.",
    attribution: "",
  },
  PT: {
    body: "I’ve got two places I like to be. Portugal is one",
    attribution: "Cliff Richard",
  },
  RO: {
    body: "I can go on forever, Romania is so beautiful!",
    attribution: "Bonnie Aarons",
  },
  RS: {
    body: "Serbia is open for business.",
    attribution: "Ivica Dacic",
  },
  RU: {
    body: "Russia is a riddle wrapped in a mystery inside an enigma.",
    attribution: "Winston Churchill",
  },
  SE: {
    body: "“There’s something I love about how stark the contrast is between January and June in Sweden.”",
    attribution: "Bill Skarsgård",
  },
  SG: {
    body: "There's nowhere that looks like Singapore; it's absolutely beautiful on a purely aesthetic level- Lisa Joy",
    attribution: "Lisa Joy",
  },
  SK: {
    body: "I don't think falling in love in Slovakia is much different from falling in love in Tunbridge Wells.- Tom Stoppard",
    attribution: "Tom Stoppard",
  },
  TH: {
    body: "Thailand was built on compassion",
    attribution: "Bhumibol Adulyadej",
  },
  TM: {
    body: "Those of us lucky enough to fall in love with Asia know that it's an affair that's as long as it is resonant.",
    attribution: "",
  },
  TN: {
    body: "Tunisia is always ready to turn the page.",
    attribution: "Habib Bourguiba",
  },
  TZ: {
    body: "In Tanzania, it was more than one hundred tribal units which lost their freedom; it was one nation that regained it.",
    attribution: "Julius Kambarage Nyerere",
  },
  UA: {
    body: "I promise everyone who comes to Ukraine can see a beautiful country.- Vitali Klitschko",
    attribution: "Vitali Klitschko",
  },
  UG: {
    body: "Uganda is the most diverse country in the world.",
    attribution: "Amos Wekesa",
  },
  US: {
    body: "America has as much diversity in peoples as it does in geographies. - Terri Guillemets",
    attribution: "America",
  },
};

/** Pull line for continent hub country tiles — saying only, no attribution. */
export function getTogstrekCountryHubTileQuote(iso2: string): string | undefined {
  return togstrekCountryHubHeaderQuoteByIso2[iso2]?.body;
}
