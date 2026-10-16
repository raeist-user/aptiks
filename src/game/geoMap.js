// Draws the Guess Country globes. Same mechanism as the Discord bot (Natural
// Earth GeoJSON + d3-geo orthographic projection, globe turned so the chosen
// country is in the middle, tiny countries get a ring), but output is an SVG
// string served straight to the browser (no PNG step, no native dependency),
// and every colour comes from the Aptiks theme below.
const fs = require('fs');
const path = require('path');

// Aptiks theme (same values as the tailwind.config in public/home.html).
const THEME = {
  sea: '#1E1E1E',        // input-bg   — the globe itself
  land: '#3A3A3A',       // border-color — every other country
  landBorder: '#1E1E1E', // thin gaps between countries
  chosen: '#E2B714',     // accent     — the country to guess
  chosenLine: '#9C7F0E', // darker accent outline
  lake: '#1E1E1E',
  graticule: '#747474',  // text-muted
  rim: '#3A3A3A',
};
const DIAMETER = 550;

// ISO alpha-2 codes Natural Earth leaves as "-99" (France, Norway, Kosovo ...).
const A3_FIX = { FRA: 'FR', NOR: 'NO', KOS: 'XK', NCY: null, SOL: null, SDS: 'SS', PSX: 'PS', TWN: 'TW', ESH: null };
const valid = (v) => typeof v === 'string' && /^[A-Z]{2}$/.test(v);
function countryCode(p = {}) {
  if (p.ADM0_A3 in A3_FIX) return A3_FIX[p.ADM0_A3];
  for (const k of ['ISO_A2_EH', 'ISO_A2']) if (valid(p[k])) return p[k];
  return null;
}

const read = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'geo', f), 'utf8'));
let world = null; // { countries, lakes, byCode }
function loadWorld() {
  if (world) return world;
  const countries = read('countries.json');
  let lakes = { features: [] };
  try { lakes = read('lakes.json'); } catch (_) { /* lakes are cosmetic */ }
  const byCode = new Map();
  for (const f of countries.features) {
    const code = countryCode(f.properties);
    if (!code) continue;
    if (!byCode.has(code)) byCode.set(code, []);
    byCode.get(code).push(f);
  }
  world = { countries, lakes, byCode };
  return world;
}

/** Codes that have a shape in the data — the game only asks about these. */
const availableCodes = () => new Set(loadWorld().byCode.keys());

let d3p = null;
const d3 = () => (d3p ??= import('d3-geo')); // d3-geo v3 is ESM-only

/** Largest polygon of a feature, so France / USA / Norway centre on the mainland. */
function mainland(feature, d3geo) {
  const g = feature.geometry;
  if (g?.type !== 'MultiPolygon') return feature;
  let best = null; let bestArea = -1;
  for (const coords of g.coordinates) {
    const poly = { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: coords } };
    const a = d3geo.geoArea(poly);
    if (a > bestArea) { best = poly; bestArea = a; }
  }
  return best ?? feature;
}

const GRADIENT = [[0, 0], [0.5, 0.006], [0.56, 0.009], [0.64, 0.017], [0.7, 0.039], [0.74, 0.055], [1, 0.142]]
  .map(([o, a]) => `<stop offset="${o}" stop-color="#000" stop-opacity="${a * 2.5}"/>`).join('');

const cache = new Map();

/** SVG string for a country code (e.g. "FR"), or null when there is no shape for it. */
async function countryGlobeSvg(code) {
  if (cache.has(code)) return cache.get(code);
  const { countries, lakes, byCode } = loadWorld();
  const features = byCode.get(code);
  if (!features || !features.length) return null;
  const d3geo = await d3();
  const D = DIAMETER;
  const target = features.map((f) => mainland(f, d3geo)).sort((a, b) => d3geo.geoArea(b) - d3geo.geoArea(a))[0];
  const [lon, lat] = d3geo.geoCentroid(target);
  const projection = d3geo.geoOrthographic().fitSize([D, D], { type: 'Sphere' }).rotate([-lon, -lat]).precision(0.5);
  const path = d3geo.geoPath(projection);
  const selected = new Set(features);
  const draw = (list) => list.map((f) => { const d = path(f); return d ? `<path d="${d}"/>` : ''; }).join('');

  const land = draw(countries.features.filter((f) => !selected.has(f)));
  const chosen = draw(features);
  const lakePaths = draw(lakes.features);
  const grat = path(d3geo.geoGraticule().step([30, 30])());

  // Tiny countries would be a speck on a whole globe: ring them.
  const area = features.reduce((sum, f) => sum + (path.area(f) || 0), 0);
  let ring = '';
  if (area < 90) {
    const c = projection([lon, lat]);
    if (c) ring = `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="16" fill="none" stroke="${THEME.chosen}" stroke-width="2.5"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${D}" height="${D}" viewBox="0 0 ${D} ${D}">
<defs><radialGradient id="shade" cx="${D * 0.48}" cy="${D * 0.35}" r="${D * 0.64}" gradientUnits="userSpaceOnUse">${GRADIENT}</radialGradient></defs>
<circle cx="${D / 2}" cy="${D / 2}" r="${D / 2}" fill="${THEME.sea}"/>
<g fill="${THEME.land}" stroke="${THEME.landBorder}" stroke-width="0.5" stroke-linejoin="round">${land}</g>
<g fill="${THEME.chosen}" stroke="${THEME.chosenLine}" stroke-width="0.5" stroke-linejoin="round">${chosen}</g>
<g fill="${THEME.lake}" stroke="none">${lakePaths}</g>
<path d="${grat ?? ''}" fill="none" stroke="${THEME.graticule}" stroke-width="0.3" opacity="0.5"/>
${ring}
<circle cx="${D / 2}" cy="${D / 2}" r="${D / 2}" fill="url(#shade)" stroke="${THEME.rim}" stroke-width="1.5"/>
</svg>`;
  cache.set(code, svg);
  return svg;
}

module.exports = { countryGlobeSvg, availableCodes, THEME };
