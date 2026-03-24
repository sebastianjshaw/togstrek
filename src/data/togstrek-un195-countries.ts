/** UN-style sovereign list: 193 member states + Guinea-Bissau (restcountries API omits unMember) + Holy See + Palestine = 195. Names and UN regions via restcountries.com. */
export type TogstrekUnContinentId =
  | "africa"
  | "antarctica"
  | "asia"
  | "europe"
  | "north-america"
  | "oceania"
  | "south-america"
  | "other";

export type TogstrekUn195Country = {
  iso2: string;
  name: string;
  continent: TogstrekUnContinentId;
};

export const togstrekUn195Countries: TogstrekUn195Country[] = [
  {
    "iso2": "AF",
    "name": "Afghanistan",
    "continent": "asia"
  },
  {
    "iso2": "AL",
    "name": "Albania",
    "continent": "europe"
  },
  {
    "iso2": "DZ",
    "name": "Algeria",
    "continent": "africa"
  },
  {
    "iso2": "AD",
    "name": "Andorra",
    "continent": "europe"
  },
  {
    "iso2": "AO",
    "name": "Angola",
    "continent": "africa"
  },
  {
    "iso2": "AG",
    "name": "Antigua and Barbuda",
    "continent": "north-america"
  },
  {
    "iso2": "AR",
    "name": "Argentina",
    "continent": "south-america"
  },
  {
    "iso2": "AM",
    "name": "Armenia",
    "continent": "asia"
  },
  {
    "iso2": "AU",
    "name": "Australia",
    "continent": "oceania"
  },
  {
    "iso2": "AT",
    "name": "Austria",
    "continent": "europe"
  },
  {
    "iso2": "AZ",
    "name": "Azerbaijan",
    "continent": "asia"
  },
  {
    "iso2": "BS",
    "name": "Bahamas",
    "continent": "north-america"
  },
  {
    "iso2": "BH",
    "name": "Bahrain",
    "continent": "asia"
  },
  {
    "iso2": "BD",
    "name": "Bangladesh",
    "continent": "asia"
  },
  {
    "iso2": "BB",
    "name": "Barbados",
    "continent": "north-america"
  },
  {
    "iso2": "BY",
    "name": "Belarus",
    "continent": "europe"
  },
  {
    "iso2": "BE",
    "name": "Belgium",
    "continent": "europe"
  },
  {
    "iso2": "BZ",
    "name": "Belize",
    "continent": "north-america"
  },
  {
    "iso2": "BJ",
    "name": "Benin",
    "continent": "africa"
  },
  {
    "iso2": "BT",
    "name": "Bhutan",
    "continent": "asia"
  },
  {
    "iso2": "BO",
    "name": "Bolivia",
    "continent": "south-america"
  },
  {
    "iso2": "BA",
    "name": "Bosnia and Herzegovina",
    "continent": "europe"
  },
  {
    "iso2": "BW",
    "name": "Botswana",
    "continent": "africa"
  },
  {
    "iso2": "BR",
    "name": "Brazil",
    "continent": "south-america"
  },
  {
    "iso2": "BN",
    "name": "Brunei",
    "continent": "asia"
  },
  {
    "iso2": "BG",
    "name": "Bulgaria",
    "continent": "europe"
  },
  {
    "iso2": "BF",
    "name": "Burkina Faso",
    "continent": "africa"
  },
  {
    "iso2": "BI",
    "name": "Burundi",
    "continent": "africa"
  },
  {
    "iso2": "KH",
    "name": "Cambodia",
    "continent": "asia"
  },
  {
    "iso2": "CM",
    "name": "Cameroon",
    "continent": "africa"
  },
  {
    "iso2": "CA",
    "name": "Canada",
    "continent": "north-america"
  },
  {
    "iso2": "CV",
    "name": "Cape Verde",
    "continent": "africa"
  },
  {
    "iso2": "CF",
    "name": "Central African Republic",
    "continent": "africa"
  },
  {
    "iso2": "TD",
    "name": "Chad",
    "continent": "africa"
  },
  {
    "iso2": "CL",
    "name": "Chile",
    "continent": "south-america"
  },
  {
    "iso2": "CN",
    "name": "China",
    "continent": "asia"
  },
  {
    "iso2": "CO",
    "name": "Colombia",
    "continent": "south-america"
  },
  {
    "iso2": "KM",
    "name": "Comoros",
    "continent": "africa"
  },
  {
    "iso2": "CR",
    "name": "Costa Rica",
    "continent": "north-america"
  },
  {
    "iso2": "HR",
    "name": "Croatia",
    "continent": "europe"
  },
  {
    "iso2": "CU",
    "name": "Cuba",
    "continent": "north-america"
  },
  {
    "iso2": "CY",
    "name": "Cyprus",
    "continent": "europe"
  },
  {
    "iso2": "CZ",
    "name": "Czechia",
    "continent": "europe"
  },
  {
    "iso2": "DK",
    "name": "Denmark",
    "continent": "europe"
  },
  {
    "iso2": "DJ",
    "name": "Djibouti",
    "continent": "africa"
  },
  {
    "iso2": "DM",
    "name": "Dominica",
    "continent": "north-america"
  },
  {
    "iso2": "DO",
    "name": "Dominican Republic",
    "continent": "north-america"
  },
  {
    "iso2": "CD",
    "name": "DR Congo",
    "continent": "africa"
  },
  {
    "iso2": "EC",
    "name": "Ecuador",
    "continent": "south-america"
  },
  {
    "iso2": "EG",
    "name": "Egypt",
    "continent": "africa"
  },
  {
    "iso2": "SV",
    "name": "El Salvador",
    "continent": "north-america"
  },
  {
    "iso2": "GQ",
    "name": "Equatorial Guinea",
    "continent": "africa"
  },
  {
    "iso2": "ER",
    "name": "Eritrea",
    "continent": "africa"
  },
  {
    "iso2": "EE",
    "name": "Estonia",
    "continent": "europe"
  },
  {
    "iso2": "SZ",
    "name": "Eswatini",
    "continent": "africa"
  },
  {
    "iso2": "ET",
    "name": "Ethiopia",
    "continent": "africa"
  },
  {
    "iso2": "FJ",
    "name": "Fiji",
    "continent": "oceania"
  },
  {
    "iso2": "FI",
    "name": "Finland",
    "continent": "europe"
  },
  {
    "iso2": "FR",
    "name": "France",
    "continent": "europe"
  },
  {
    "iso2": "GA",
    "name": "Gabon",
    "continent": "africa"
  },
  {
    "iso2": "GM",
    "name": "Gambia",
    "continent": "africa"
  },
  {
    "iso2": "GE",
    "name": "Georgia",
    "continent": "asia"
  },
  {
    "iso2": "DE",
    "name": "Germany",
    "continent": "europe"
  },
  {
    "iso2": "GH",
    "name": "Ghana",
    "continent": "africa"
  },
  {
    "iso2": "GR",
    "name": "Greece",
    "continent": "europe"
  },
  {
    "iso2": "GD",
    "name": "Grenada",
    "continent": "north-america"
  },
  {
    "iso2": "GT",
    "name": "Guatemala",
    "continent": "north-america"
  },
  {
    "iso2": "GN",
    "name": "Guinea",
    "continent": "africa"
  },
  {
    "iso2": "GW",
    "name": "Guinea-Bissau",
    "continent": "africa"
  },
  {
    "iso2": "GY",
    "name": "Guyana",
    "continent": "south-america"
  },
  {
    "iso2": "HT",
    "name": "Haiti",
    "continent": "north-america"
  },
  {
    "iso2": "HN",
    "name": "Honduras",
    "continent": "north-america"
  },
  {
    "iso2": "HU",
    "name": "Hungary",
    "continent": "europe"
  },
  {
    "iso2": "IS",
    "name": "Iceland",
    "continent": "europe"
  },
  {
    "iso2": "IN",
    "name": "India",
    "continent": "asia"
  },
  {
    "iso2": "ID",
    "name": "Indonesia",
    "continent": "asia"
  },
  {
    "iso2": "IR",
    "name": "Iran",
    "continent": "asia"
  },
  {
    "iso2": "IQ",
    "name": "Iraq",
    "continent": "asia"
  },
  {
    "iso2": "IE",
    "name": "Ireland",
    "continent": "europe"
  },
  {
    "iso2": "IL",
    "name": "Israel",
    "continent": "asia"
  },
  {
    "iso2": "IT",
    "name": "Italy",
    "continent": "europe"
  },
  {
    "iso2": "CI",
    "name": "Ivory Coast",
    "continent": "africa"
  },
  {
    "iso2": "JM",
    "name": "Jamaica",
    "continent": "north-america"
  },
  {
    "iso2": "JP",
    "name": "Japan",
    "continent": "asia"
  },
  {
    "iso2": "JO",
    "name": "Jordan",
    "continent": "asia"
  },
  {
    "iso2": "KZ",
    "name": "Kazakhstan",
    "continent": "asia"
  },
  {
    "iso2": "KE",
    "name": "Kenya",
    "continent": "africa"
  },
  {
    "iso2": "KI",
    "name": "Kiribati",
    "continent": "oceania"
  },
  {
    "iso2": "KW",
    "name": "Kuwait",
    "continent": "asia"
  },
  {
    "iso2": "KG",
    "name": "Kyrgyzstan",
    "continent": "asia"
  },
  {
    "iso2": "LA",
    "name": "Laos",
    "continent": "asia"
  },
  {
    "iso2": "LV",
    "name": "Latvia",
    "continent": "europe"
  },
  {
    "iso2": "LB",
    "name": "Lebanon",
    "continent": "asia"
  },
  {
    "iso2": "LS",
    "name": "Lesotho",
    "continent": "africa"
  },
  {
    "iso2": "LR",
    "name": "Liberia",
    "continent": "africa"
  },
  {
    "iso2": "LY",
    "name": "Libya",
    "continent": "africa"
  },
  {
    "iso2": "LI",
    "name": "Liechtenstein",
    "continent": "europe"
  },
  {
    "iso2": "LT",
    "name": "Lithuania",
    "continent": "europe"
  },
  {
    "iso2": "LU",
    "name": "Luxembourg",
    "continent": "europe"
  },
  {
    "iso2": "MG",
    "name": "Madagascar",
    "continent": "africa"
  },
  {
    "iso2": "MW",
    "name": "Malawi",
    "continent": "africa"
  },
  {
    "iso2": "MY",
    "name": "Malaysia",
    "continent": "asia"
  },
  {
    "iso2": "MV",
    "name": "Maldives",
    "continent": "asia"
  },
  {
    "iso2": "ML",
    "name": "Mali",
    "continent": "africa"
  },
  {
    "iso2": "MT",
    "name": "Malta",
    "continent": "europe"
  },
  {
    "iso2": "MH",
    "name": "Marshall Islands",
    "continent": "oceania"
  },
  {
    "iso2": "MR",
    "name": "Mauritania",
    "continent": "africa"
  },
  {
    "iso2": "MU",
    "name": "Mauritius",
    "continent": "africa"
  },
  {
    "iso2": "MX",
    "name": "Mexico",
    "continent": "north-america"
  },
  {
    "iso2": "FM",
    "name": "Micronesia",
    "continent": "oceania"
  },
  {
    "iso2": "MD",
    "name": "Moldova",
    "continent": "europe"
  },
  {
    "iso2": "MC",
    "name": "Monaco",
    "continent": "europe"
  },
  {
    "iso2": "MN",
    "name": "Mongolia",
    "continent": "asia"
  },
  {
    "iso2": "ME",
    "name": "Montenegro",
    "continent": "europe"
  },
  {
    "iso2": "MA",
    "name": "Morocco",
    "continent": "africa"
  },
  {
    "iso2": "MZ",
    "name": "Mozambique",
    "continent": "africa"
  },
  {
    "iso2": "MM",
    "name": "Myanmar",
    "continent": "asia"
  },
  {
    "iso2": "NA",
    "name": "Namibia",
    "continent": "africa"
  },
  {
    "iso2": "NR",
    "name": "Nauru",
    "continent": "oceania"
  },
  {
    "iso2": "NP",
    "name": "Nepal",
    "continent": "asia"
  },
  {
    "iso2": "NL",
    "name": "Netherlands",
    "continent": "europe"
  },
  {
    "iso2": "NZ",
    "name": "New Zealand",
    "continent": "oceania"
  },
  {
    "iso2": "NI",
    "name": "Nicaragua",
    "continent": "north-america"
  },
  {
    "iso2": "NE",
    "name": "Niger",
    "continent": "africa"
  },
  {
    "iso2": "NG",
    "name": "Nigeria",
    "continent": "africa"
  },
  {
    "iso2": "KP",
    "name": "North Korea",
    "continent": "asia"
  },
  {
    "iso2": "MK",
    "name": "North Macedonia",
    "continent": "europe"
  },
  {
    "iso2": "NO",
    "name": "Norway",
    "continent": "europe"
  },
  {
    "iso2": "OM",
    "name": "Oman",
    "continent": "asia"
  },
  {
    "iso2": "PK",
    "name": "Pakistan",
    "continent": "asia"
  },
  {
    "iso2": "PW",
    "name": "Palau",
    "continent": "oceania"
  },
  {
    "iso2": "PS",
    "name": "Palestine",
    "continent": "asia"
  },
  {
    "iso2": "PA",
    "name": "Panama",
    "continent": "north-america"
  },
  {
    "iso2": "PG",
    "name": "Papua New Guinea",
    "continent": "oceania"
  },
  {
    "iso2": "PY",
    "name": "Paraguay",
    "continent": "south-america"
  },
  {
    "iso2": "PE",
    "name": "Peru",
    "continent": "south-america"
  },
  {
    "iso2": "PH",
    "name": "Philippines",
    "continent": "asia"
  },
  {
    "iso2": "PL",
    "name": "Poland",
    "continent": "europe"
  },
  {
    "iso2": "PT",
    "name": "Portugal",
    "continent": "europe"
  },
  {
    "iso2": "QA",
    "name": "Qatar",
    "continent": "asia"
  },
  {
    "iso2": "CG",
    "name": "Republic of the Congo",
    "continent": "africa"
  },
  {
    "iso2": "RO",
    "name": "Romania",
    "continent": "europe"
  },
  {
    "iso2": "RU",
    "name": "Russia",
    "continent": "europe"
  },
  {
    "iso2": "RW",
    "name": "Rwanda",
    "continent": "africa"
  },
  {
    "iso2": "KN",
    "name": "Saint Kitts and Nevis",
    "continent": "north-america"
  },
  {
    "iso2": "LC",
    "name": "Saint Lucia",
    "continent": "north-america"
  },
  {
    "iso2": "VC",
    "name": "Saint Vincent and the Grenadines",
    "continent": "north-america"
  },
  {
    "iso2": "WS",
    "name": "Samoa",
    "continent": "oceania"
  },
  {
    "iso2": "SM",
    "name": "San Marino",
    "continent": "europe"
  },
  {
    "iso2": "ST",
    "name": "São Tomé and Príncipe",
    "continent": "africa"
  },
  {
    "iso2": "SA",
    "name": "Saudi Arabia",
    "continent": "asia"
  },
  {
    "iso2": "SN",
    "name": "Senegal",
    "continent": "africa"
  },
  {
    "iso2": "RS",
    "name": "Serbia",
    "continent": "europe"
  },
  {
    "iso2": "SC",
    "name": "Seychelles",
    "continent": "africa"
  },
  {
    "iso2": "SL",
    "name": "Sierra Leone",
    "continent": "africa"
  },
  {
    "iso2": "SG",
    "name": "Singapore",
    "continent": "asia"
  },
  {
    "iso2": "SK",
    "name": "Slovakia",
    "continent": "europe"
  },
  {
    "iso2": "SI",
    "name": "Slovenia",
    "continent": "europe"
  },
  {
    "iso2": "SB",
    "name": "Solomon Islands",
    "continent": "oceania"
  },
  {
    "iso2": "SO",
    "name": "Somalia",
    "continent": "africa"
  },
  {
    "iso2": "ZA",
    "name": "South Africa",
    "continent": "africa"
  },
  {
    "iso2": "KR",
    "name": "South Korea",
    "continent": "asia"
  },
  {
    "iso2": "SS",
    "name": "South Sudan",
    "continent": "africa"
  },
  {
    "iso2": "ES",
    "name": "Spain",
    "continent": "europe"
  },
  {
    "iso2": "LK",
    "name": "Sri Lanka",
    "continent": "asia"
  },
  {
    "iso2": "SD",
    "name": "Sudan",
    "continent": "africa"
  },
  {
    "iso2": "SR",
    "name": "Suriname",
    "continent": "south-america"
  },
  {
    "iso2": "SE",
    "name": "Sweden",
    "continent": "europe"
  },
  {
    "iso2": "CH",
    "name": "Switzerland",
    "continent": "europe"
  },
  {
    "iso2": "SY",
    "name": "Syria",
    "continent": "asia"
  },
  {
    "iso2": "TJ",
    "name": "Tajikistan",
    "continent": "asia"
  },
  {
    "iso2": "TZ",
    "name": "Tanzania",
    "continent": "africa"
  },
  {
    "iso2": "TH",
    "name": "Thailand",
    "continent": "asia"
  },
  {
    "iso2": "TL",
    "name": "Timor-Leste",
    "continent": "asia"
  },
  {
    "iso2": "TG",
    "name": "Togo",
    "continent": "africa"
  },
  {
    "iso2": "TO",
    "name": "Tonga",
    "continent": "oceania"
  },
  {
    "iso2": "TT",
    "name": "Trinidad and Tobago",
    "continent": "north-america"
  },
  {
    "iso2": "TN",
    "name": "Tunisia",
    "continent": "africa"
  },
  {
    "iso2": "TR",
    "name": "Turkey",
    "continent": "asia"
  },
  {
    "iso2": "TM",
    "name": "Turkmenistan",
    "continent": "asia"
  },
  {
    "iso2": "TV",
    "name": "Tuvalu",
    "continent": "oceania"
  },
  {
    "iso2": "UG",
    "name": "Uganda",
    "continent": "africa"
  },
  {
    "iso2": "UA",
    "name": "Ukraine",
    "continent": "europe"
  },
  {
    "iso2": "AE",
    "name": "United Arab Emirates",
    "continent": "asia"
  },
  {
    "iso2": "GB",
    "name": "United Kingdom",
    "continent": "europe"
  },
  {
    "iso2": "US",
    "name": "United States",
    "continent": "north-america"
  },
  {
    "iso2": "UY",
    "name": "Uruguay",
    "continent": "south-america"
  },
  {
    "iso2": "UZ",
    "name": "Uzbekistan",
    "continent": "asia"
  },
  {
    "iso2": "VU",
    "name": "Vanuatu",
    "continent": "oceania"
  },
  {
    "iso2": "VA",
    "name": "Vatican City",
    "continent": "europe"
  },
  {
    "iso2": "VE",
    "name": "Venezuela",
    "continent": "south-america"
  },
  {
    "iso2": "VN",
    "name": "Vietnam",
    "continent": "asia"
  },
  {
    "iso2": "YE",
    "name": "Yemen",
    "continent": "asia"
  },
  {
    "iso2": "ZM",
    "name": "Zambia",
    "continent": "africa"
  },
  {
    "iso2": "ZW",
    "name": "Zimbabwe",
    "continent": "africa"
  }
];
