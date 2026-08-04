import type { ReactNode } from "react";

const togstrekCountryHubIntroProseClass =
  "togstrek-country-hub-intro-prose space-y-[var(--tt-space-5)] font-tt-body text-[length:var(--tt-text-body)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary [overflow-wrap:anywhere]";

const canadaHubIntro = (
  <div className={togstrekCountryHubIntroProseClass}>
    <p>
      I&apos;ve barely scratched the surface of Canada. So far it&apos;s one
      story: crossing the border from the US to the Canadian side of Niagara
      Falls — splendour and scale I still trust my memory on — and everything
      else a mix of what I think I saw and what years of film and television have
      layered on top.
    </p>
    <p>
      The place page here is deliberately small; the country isn&apos;t, and
      future trips get their own entries when they happen.
    </p>
  </div>
);

const egyptHubIntro = (
  <div className={togstrekCountryHubIntroProseClass}>
    <p>
      Egypt is, in one sense, exactly what you expect: the pyramids are as large
      as advertised, the temples as numerous, the heat as serious. In another
      sense it takes you by surprise, because the scale of what survives here is
      not something photographs prepare you for. Civilisations rose and fell
      across this stretch of the Nile for three thousand years before Alexander
      the Great arrived, and their physical remains are still standing, still
      sharp, still covered in paint in the places the sun hasn&apos;t reached.
      That is not a normal thing.
    </p>
    <p>
      The country divides naturally along the river. Egypt&apos;s topography is
      mainly desert plateau, cut by the Nile valley, and that geography has
      defined everything: where people settled, where temples were built, where
      the ancient dead were buried. Outside the fertile strip on either bank, the
      desert begins immediately and doesn&apos;t relent. On the Nile cruise,
      watching the country from the deck in the afternoons, you can see exactly
      where the water&apos;s reach ends — vivid green right to the edge, then
      sand. The Nile is also, unexpectedly, a rich green itself when you get
      close to the banks, a colour that takes some adjusting to.
    </p>
    <p>
      Pharaonic Egypt thrived for around three thousand years before
      Alexander&apos;s conquest in 323 BCE, after which it became part of the
      Hellenistic world. Rome followed, then the Byzantine Empire, then Arab
      Muslim conquest in the seventh century CE. The layers of that history are
      visible everywhere: Coptic churches built inside temple precincts, mosques
      alongside ancient ruins, the nineteenth-century colonial fingerprints still
      legible in Cairo&apos;s architecture and railway stock.
    </p>
    <p>
      I&apos;ve visited Egypt twice, by different routes. The first was a Nile
      cruise from Luxor south to the Aswan Dam and back, on a small ship of
      twenty cabins with silver service meals and a schedule built around the
      heat, all tours done before the day broke open, back on board before
      eleven. The temples in that light, in that dry air, are something else.
      Colours survive in sheltered crevices, blues and yellows still sharp after
      three thousand years. The bas-reliefs are crisp in a way that feels almost
      impossible. The second trip was overland with G Adventures: Cairo first,
      then south by night train to Aswan, across to Abu Simbel, and back up
      through Kom Ombo and Luxor. The pyramids for the first time. A very
      different pace, and a very different Egypt.
    </p>
    <p className="font-tt-display font-semibold text-tt-text-primary">
      Both are worth your time. They are not the same country.
    </p>
  </div>
);

const cambodiaHubIntro = (
  <div className={togstrekCountryHubIntroProseClass}>
    <p>
      <strong>Tuk tuks.</strong>{" "}
      Use the PassApp or Grab apps and the price is fixed upfront, often just
      a 2–3 minute wait anywhere in town. Street hailing requires bargaining,
      but they&apos;re pretty happy to do so.
    </p>
    <p>
      <strong>Phnom Penh Airport.</strong>{" "}
      New and huge. It&apos;s far bigger than currently needed, and clearly
      built for future growth. Clean, modern, and fast to get through.
    </p>
    <p>
      <strong>Money.</strong>{" "}
      USD and Cambodian riel are used interchangeably. ATMs dispense both.
      Bring plenty of $1 bills for tips and small fares, as you won&apos;t
      see them much in change. Notes with any tears are rejected.
    </p>
  </div>
);

const turkmenistanHubIntro = (
  <div className={togstrekCountryHubIntroProseClass}>
    <p>
      Turkmenistan is the strangest country on the route, and that is a
      considered assessment after five weeks in Central Asia. It is one of the
      most closed states in the world, as hard for Central Asians to enter as for
      anyone else, governed by a president who received 97.67% of the vote on a
      97.2% turnout, holds the title Protector and Pillar of the Nation, controls
      around 80% of the country&apos;s oil and gas income, and has authored more
      than 63 books. His previous occupation was dentist to the first president,
      which is a career trajectory that repays reflection.
    </p>
    <p>
      The internet is heavily restricted. WhatsApp doesn&apos;t work. E-sims
      and roaming are unavailable. You are, for the duration, genuinely off the
      grid.
    </p>
    <p>
      The border crossing involves a no-man&apos;s land wait, a long wait at
      Turkmen border control while the guide sorts paperwork, a mandatory Covid
      test at $42 per person regardless of when you&apos;re reading this, and,
      on this visit, two power cuts. Once through, the hotel is beautiful and
      the infrastructure unexpectedly impressive. Petrol is effectively free.
      Camels appear at the roadside without warning or explanation and then
      continue to appear just after that, in larger numbers.
    </p>
    <p>
      The jashmax, a veil worn by some Turkmen women, is visible throughout, a
      reminder that this is a country with its own distinct cultural traditions
      that exist entirely independently of outside observation.
    </p>
    <p>
      Twenty-six days of travel across four countries has been, at various
      points, complicated, frustrating, revelatory, and occasionally a disaster
      in the bathroom department. Turkmenistan is the final act, and it saves
      some of its best material for last.
    </p>
  </div>
);

/**
 * Optional long-form intro for `/{continent}/{country}` — rendered after the
 * breadcrumb and before the map.
 */
export function getTogstrekCountryHubIntro(
  continent: string,
  country: string,
): ReactNode | undefined {
  if (continent === "north-america" && country === "canada") {
    return canadaHubIntro;
  }
  if (continent === "africa" && country === "egypt") {
    return egyptHubIntro;
  }
  if (continent === "asia" && country === "cambodia") {
    return cambodiaHubIntro;
  }
  if (continent === "asia" && country === "turkmenistan") {
    return turkmenistanHubIntro;
  }
  return undefined;
}
