// Country list: [ISO 3166-1 alpha-2, display name, ...other accepted spellings]. The flag emoji is built from the code.
const RAW = [
  ['AF', 'Afghanistan'], ['AL', 'Albania'], ['DZ', 'Algeria'], ['AD', 'Andorra'], ['AO', 'Angola'],
  ['AG', 'Antigua and Barbuda', 'Antigua'], ['AR', 'Argentina'], ['AM', 'Armenia'], ['AU', 'Australia'], ['AT', 'Austria'],
  ['AZ', 'Azerbaijan'], ['BS', 'Bahamas', 'The Bahamas'], ['BH', 'Bahrain'], ['BD', 'Bangladesh'], ['BB', 'Barbados'],
  ['BY', 'Belarus'], ['BE', 'Belgium'], ['BZ', 'Belize'], ['BJ', 'Benin'], ['BT', 'Bhutan'],
  ['BO', 'Bolivia'], ['BA', 'Bosnia and Herzegovina', 'Bosnia'], ['BW', 'Botswana'], ['BR', 'Brazil'], ['BN', 'Brunei'],
  ['BG', 'Bulgaria'], ['BF', 'Burkina Faso'], ['BI', 'Burundi'], ['KH', 'Cambodia'], ['CM', 'Cameroon'],
  ['CA', 'Canada'], ['CV', 'Cape Verde', 'Cabo Verde'], ['CF', 'Central African Republic', 'CAR'], ['TD', 'Chad'], ['CL', 'Chile'],
  ['CN', 'China', "People's Republic of China", 'PRC'], ['CO', 'Colombia'], ['KM', 'Comoros'],
  ['CG', 'Republic of the Congo', 'Congo', 'Congo-Brazzaville', 'Congo Brazzaville'],
  ['CD', 'Democratic Republic of the Congo', 'DR Congo', 'DRC', 'Congo-Kinshasa', 'Congo Kinshasa', 'Zaire'],
  ['CR', 'Costa Rica'], ['CI', 'Ivory Coast', "Cote d'Ivoire", 'Cote dIvoire'], ['HR', 'Croatia'], ['CU', 'Cuba'], ['CY', 'Cyprus'],
  ['CZ', 'Czech Republic', 'Czechia'], ['DK', 'Denmark'], ['DJ', 'Djibouti'], ['DM', 'Dominica'], ['DO', 'Dominican Republic'],
  ['EC', 'Ecuador'], ['EG', 'Egypt'], ['SV', 'El Salvador'], ['GQ', 'Equatorial Guinea'], ['ER', 'Eritrea'],
  ['EE', 'Estonia'], ['SZ', 'Eswatini', 'Swaziland'], ['ET', 'Ethiopia'], ['FJ', 'Fiji'], ['FI', 'Finland'],
  ['FR', 'France'], ['GA', 'Gabon'], ['GM', 'The Gambia', 'Gambia'], ['GE', 'Georgia'], ['DE', 'Germany'],
  ['GH', 'Ghana'], ['GR', 'Greece'], ['GD', 'Grenada'], ['GT', 'Guatemala'], ['GN', 'Guinea'],
  ['GW', 'Guinea-Bissau', 'Guinea Bissau'], ['GY', 'Guyana'], ['HT', 'Haiti'], ['HN', 'Honduras'], ['HU', 'Hungary'],
  ['IS', 'Iceland'], ['IN', 'India'], ['ID', 'Indonesia'], ['IR', 'Iran'], ['IQ', 'Iraq'],
  ['IE', 'Ireland'], ['IL', 'Israel'], ['IT', 'Italy'], ['JM', 'Jamaica'], ['JP', 'Japan'],
  ['JO', 'Jordan'], ['KZ', 'Kazakhstan'], ['KE', 'Kenya'], ['KI', 'Kiribati'], ['XK', 'Kosovo'],
  ['KW', 'Kuwait'], ['KG', 'Kyrgyzstan'], ['LA', 'Laos'], ['LV', 'Latvia'], ['LB', 'Lebanon'],
  ['LS', 'Lesotho'], ['LR', 'Liberia'], ['LY', 'Libya'], ['LI', 'Liechtenstein'], ['LT', 'Lithuania'],
  ['LU', 'Luxembourg'], ['MG', 'Madagascar'], ['MW', 'Malawi'], ['MY', 'Malaysia'], ['MV', 'Maldives'],
  ['ML', 'Mali'], ['MT', 'Malta'], ['MH', 'Marshall Islands'], ['MR', 'Mauritania'], ['MU', 'Mauritius'],
  ['MX', 'Mexico'], ['FM', 'Federated States of Micronesia', 'Micronesia'], ['MD', 'Moldova'], ['MC', 'Monaco'], ['MN', 'Mongolia'],
  ['ME', 'Montenegro'], ['MA', 'Morocco'], ['MZ', 'Mozambique'], ['MM', 'Myanmar', 'Burma'], ['NA', 'Namibia'],
  ['NR', 'Nauru'], ['NP', 'Nepal'], ['NL', 'Netherlands', 'The Netherlands', 'Holland'], ['NZ', 'New Zealand'], ['NI', 'Nicaragua'],
  ['NE', 'Niger'], ['NG', 'Nigeria'], ['KP', 'North Korea'], ['MK', 'North Macedonia', 'Macedonia'], ['NO', 'Norway'],
  ['OM', 'Oman'], ['PK', 'Pakistan'], ['PW', 'Palau'], ['PS', 'Palestine', 'State of Palestine'], ['PA', 'Panama'],
  ['PG', 'Papua New Guinea'], ['PY', 'Paraguay'], ['PE', 'Peru'], ['PH', 'Philippines', 'The Philippines'], ['PL', 'Poland'],
  ['PT', 'Portugal'], ['QA', 'Qatar'], ['RO', 'Romania'], ['RU', 'Russia', 'Russian Federation'], ['RW', 'Rwanda'],
  ['KN', 'Saint Kitts and Nevis', 'St Kitts and Nevis', 'St. Kitts and Nevis'], ['LC', 'Saint Lucia', 'St Lucia', 'St. Lucia'],
  ['VC', 'Saint Vincent and the Grenadines', 'St Vincent and the Grenadines', 'St. Vincent and the Grenadines'],
  ['WS', 'Samoa'], ['SM', 'San Marino'], ['ST', 'São Tomé and Príncipe', 'Sao Tome and Principe', 'Sao Tome'],
  ['SA', 'Saudi Arabia'], ['SN', 'Senegal'], ['RS', 'Serbia'], ['SC', 'Seychelles'], ['SL', 'Sierra Leone'],
  ['SG', 'Singapore'], ['SK', 'Slovakia'], ['SI', 'Slovenia'], ['SB', 'Solomon Islands'], ['SO', 'Somalia'],
  ['ZA', 'South Africa'], ['KR', 'South Korea'], ['SS', 'South Sudan'], ['ES', 'Spain'], ['LK', 'Sri Lanka'],
  ['SD', 'Sudan'], ['SR', 'Suriname'], ['SE', 'Sweden'], ['CH', 'Switzerland'], ['SY', 'Syria'],
  ['TW', 'Taiwan'], ['TJ', 'Tajikistan'], ['TZ', 'Tanzania'], ['TH', 'Thailand'], ['TL', 'East Timor', 'Timor-Leste', 'Timor Leste'],
  ['TG', 'Togo'], ['TO', 'Tonga'], ['TT', 'Trinidad and Tobago', 'Trinidad'], ['TN', 'Tunisia'], ['TR', 'Turkey', 'Türkiye', 'Turkiye'],
  ['TM', 'Turkmenistan'], ['TV', 'Tuvalu'], ['UG', 'Uganda'], ['UA', 'Ukraine'], ['AE', 'United Arab Emirates', 'UAE'],
  ['GB', 'United Kingdom', 'UK', 'Great Britain', 'Britain'], ['US', 'United States', 'USA', 'United States of America', 'America'],
  ['UY', 'Uruguay'], ['UZ', 'Uzbekistan'], ['VU', 'Vanuatu'], ['VA', 'Vatican City', 'Vatican', 'Holy See'],
  ['VE', 'Venezuela'], ['VN', 'Vietnam', 'Viet Nam'], ['YE', 'Yemen'], ['ZM', 'Zambia'], ['ZW', 'Zimbabwe'],
];

/** "ET" -> the Ethiopian flag emoji (two regional-indicator letters). */
const flagEmoji = (code) => String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

const COUNTRIES = RAW.map(([code, name, ...aliases]) => ({ code, name, aliases, flag: flagEmoji(code) }));

/** Lowercase, no accents or punctuation, "&" = "and", no leading "the". Used to compare guesses with names. */
function normalize(text) {
  return String(text ?? '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’`.]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/^the /, '');
}

const INDEX = new Map();
for (const c of COUNTRIES) for (const n of [c.name, ...c.aliases]) INDEX.set(normalize(n), c);
const CONGOS = new Set(['CG', 'CD']);

/** The country a guess names, or null. Whole-message match only, so chat like "I think it is chad lol" is not a guess. */
const matchCountry = (text) => INDEX.get(normalize(text)) ?? null;

/** True when the text names `country`. A bare "Congo" is accepted for both Congos, since people can't tell which one they see. */
function isCorrectGuess(text, country) {
  const guess = matchCountry(text);
  if (!guess) return false;
  if (CONGOS.has(country.code) && CONGOS.has(guess.code) && normalize(text) === 'congo') return true;
  return guess.code === country.code;
}

// ---------- difficulty modes for !guesscountry <amount> <time> <easy|medium|hard> ----------
// easy   = famous countries only
// medium = easy + the less famous ones most people have still heard of (Fiji, Philippines, Mali, ...)
// hard   = medium + every other country (small islands, microstates, countries only map experts know) = the full list
const EASY_CODES = new Set([
  'US', 'CA', 'MX', 'BR', 'AR', 'CO', 'PE', 'CL', 'CU', 'GB', 'FR', 'DE', 'IT', 'ES', 'PT', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK',
  'FI', 'IE', 'PL', 'GR', 'TR', 'RU', 'UA', 'CN', 'JP', 'KR', 'KP', 'IN', 'PK', 'BD', 'ID', 'TH', 'VN', 'AU', 'NZ', 'EG', 'ZA', 'NG',
  'KE', 'ET', 'MA', 'DZ', 'SA', 'IR', 'IQ', 'IL', 'AE', 'AF',
]);
const MEDIUM_EXTRA_CODES = new Set([
  'PH', 'FJ', 'ML', 'MY', 'SG', 'TW', 'NP', 'LK', 'MM', 'KH', 'LA', 'KZ', 'UZ', 'SY', 'JO', 'LB', 'KW', 'QA', 'OM', 'YE',
  'LY', 'TN', 'SD', 'SO', 'GH', 'CI', 'SN', 'CM', 'CD', 'AO', 'TZ', 'UG', 'ZW', 'MG', 'VE', 'EC', 'BO', 'UY', 'PY', 'PA',
  'CR', 'GT', 'HN', 'NI', 'DO', 'JM', 'BS', 'CZ', 'HU', 'RO', 'BG', 'RS', 'HR', 'LT', 'LV', 'EE', 'BY', 'GE', 'AZ', 'IS',
  'CY',
]);
const MODES = ['easy', 'medium', 'hard'];
const DEFAULT_MODE = 'easy'; // no mode given = easy (famous countries only)

/** The tier a country belongs to: 'easy', 'medium' or 'hard' (the rest). */
const tierOf = (country) => (EASY_CODES.has(country.code) ? 'easy' : MEDIUM_EXTRA_CODES.has(country.code) ? 'medium' : 'hard');
const RANK = { easy: 0, medium: 1, hard: 2 };

/** Countries to play for a mode. Each mode includes the easier ones: easy < medium < hard (= all). */
const countriesForMode = (mode = DEFAULT_MODE) => COUNTRIES.filter((c) => RANK[tierOf(c)] <= RANK[mode in RANK ? mode : DEFAULT_MODE]);

/** The countries that belong to ONE tier only (easy = the easy ones, medium = just the extra ones, hard = just the extra ones on top of that). */
const tierCountries = (tier) => COUNTRIES.filter((c) => tierOf(c) === tier);

module.exports = { tierCountries, MODES, DEFAULT_MODE, EASY_CODES, MEDIUM_EXTRA_CODES, tierOf, countriesForMode, COUNTRIES, flagEmoji, normalize, matchCountry, isCorrectGuess };
