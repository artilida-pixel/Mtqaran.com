import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");

const geo = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/armenia-regions.geojson"), "utf8"));

function slugifyShapeName(name) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

// Ray-casting point-in-polygon for a single ring [[lng,lat], ...]
function pointInRing(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Polygon = [ [outerRing, hole1, ...] ]; a point is inside if inside outer ring
// and not inside any hole.
function pointInPolygonCoords(lng, lat, polygonCoords) {
  const [outer, ...holes] = polygonCoords;
  if (!pointInRing(lng, lat, outer)) return false;
  for (const hole of holes) {
    if (pointInRing(lng, lat, hole)) return false;
  }
  return true;
}

function pointInFeature(lng, lat, feature) {
  const geom = feature.geometry;
  if (geom.type === "Polygon") {
    return pointInPolygonCoords(lng, lat, geom.coordinates);
  }
  if (geom.type === "MultiPolygon") {
    return geom.coordinates.some((poly) => pointInPolygonCoords(lng, lat, poly));
  }
  return false;
}

function findRegionSlug(lng, lat) {
  for (const feature of geo.features) {
    const shapeName = feature.properties.shapeName;
    if (shapeName === "Yerevan") continue; // capital city, not a marz with villages
    if (pointInFeature(lng, lat, feature)) {
      return slugifyShapeName(shapeName);
    }
  }
  return null;
}

const ARMENIAN_RE = /[԰-֏]/;
const CYRILLIC_RE = /[Ѐ-ӿ]/;

// Rough Armenian -> Latin transliteration, close enough to GeoNames' asciiname
// romanization to disambiguate which alternate Armenian spelling is the
// CURRENT name vs. an older/historic one bundled in the same alternatenames
// list (e.g. "Աղիս" historic vs "Աղձք" current, both alternates of "Aghdzk").
const HY_MAP = {
  ա: "a", բ: "b", գ: "g", դ: "d", ե: "e", զ: "z", է: "e", ը: "y", թ: "t",
  ժ: "zh", ի: "i", լ: "l", խ: "kh", ծ: "ts", կ: "k", հ: "h", ձ: "dz", ղ: "gh",
  ճ: "ch", մ: "m", յ: "y", ն: "n", շ: "sh", ո: "vo", չ: "ch", պ: "p", ջ: "j",
  ռ: "r", ս: "s", վ: "v", տ: "t", ր: "r", ց: "ts", ւ: "u", փ: "p", ք: "k",
  օ: "o", ֆ: "f", և: "ev",
};

function armenianToLatin(str) {
  return str
    .toLowerCase()
    .split("")
    .map((ch) => HY_MAP[ch] ?? ch)
    .join("");
}

const RU_MAP = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function cyrillicToLatin(str) {
  return str
    .toLowerCase()
    .split("")
    .map((ch) => RU_MAP[ch] ?? ch)
    .join("");
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function closestByTransliteration(candidates, target, transliterate) {
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];
  const targetLower = target.toLowerCase();
  let best = candidates[0];
  let bestDist = Infinity;
  for (const c of candidates) {
    const dist = levenshtein(transliterate(c), targetLower);
    if (dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  }
  return best;
}

function pickLocalizedNames(name, asciiname, alternatenamesRaw) {
  const alts = alternatenamesRaw ? alternatenamesRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const en = asciiname || name;
  const hyCandidates = alts.filter((a) => ARMENIAN_RE.test(a));
  const ruCandidates = alts.filter((a) => CYRILLIC_RE.test(a));
  const hy = closestByTransliteration(hyCandidates, en, armenianToLatin);
  const ru = closestByTransliteration(ruCandidates, en, cyrillicToLatin);
  return {
    nameHy: hy ?? en,
    nameRu: ru ?? en,
    nameEn: en,
  };
}

function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const ALLOWED_FEATURE_CODES = new Set(["PPL", "PPLA", "PPLA2", "PPLA3", "PPLC", "PPLF", "PPLL"]);

const raw = fs.readFileSync(path.join(ROOT, "tmp_data/AM.txt"), "utf8");
const lines = raw.split("\n").filter(Boolean);

const results = [];
const seenSlugs = new Map();

for (const line of lines) {
  const cols = line.split("\t");
  const [
    geonameid,
    name,
    asciiname,
    alternatenames,
    latitude,
    longitude,
    featureClass,
    featureCode,
    countryCode,
    ,
    ,
    ,
    ,
    ,
    populationRaw,
  ] = cols;

  if (countryCode !== "AM") continue;
  if (featureClass !== "P") continue;
  if (!ALLOWED_FEATURE_CODES.has(featureCode)) continue;

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

  const regionSlug = findRegionSlug(lng, lat);
  if (!regionSlug) continue; // outside our 10 marzes (incl. anything outside Armenia's own territory)

  const { nameHy, nameRu, nameEn } = pickLocalizedNames(name, asciiname, alternatenames);
  const population = parseInt(populationRaw, 10);

  let baseSlug = slugify(`${asciiname || name}-${regionSlug}`);
  if (!baseSlug) baseSlug = `village-${geonameid}`;
  let slug = baseSlug;
  let n = 2;
  while (seenSlugs.has(slug)) {
    slug = `${baseSlug}-${n++}`;
  }
  seenSlugs.set(slug, true);

  results.push({
    slug,
    regionSlug,
    nameHy,
    nameRu,
    nameEn,
    lat,
    lng,
    population: Number.isFinite(population) && population > 0 ? population : null,
  });
}

results.sort((a, b) => a.regionSlug.localeCompare(b.regionSlug) || a.nameEn.localeCompare(b.nameEn));

const byRegion = {};
for (const r of results) byRegion[r.regionSlug] = (byRegion[r.regionSlug] ?? 0) + 1;

console.log("Total villages matched to a marz:", results.length);
console.log("By region:", byRegion);

fs.writeFileSync(
  path.join(ROOT, "src/data/armenia-villages.json"),
  JSON.stringify(results, null, 2)
);
console.log("Wrote src/data/armenia-villages.json");
