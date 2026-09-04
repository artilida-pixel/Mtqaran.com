import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");

// src/data/official-villages-954.json is the Republic of Armenia's current
// registry of active rural villages by marz (954 total, September 2026),
// extracted from a government docx the user supplied. Our own
// armenia-villages.json comes from GeoNames, which mixes in marz-capital
// cities, district towns, and other non-rural populated places alongside
// real villages — this script trims it down to just what the official
// registry recognizes as a village, matching by name (with light fuzzy
// matching for spelling variants between the two independently-transcribed
// sources) rather than by feature code, since GeoNames' feature codes don't
// reliably distinguish "city" from "village" for Armenia.
const official = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/official-villages-954.json"), "utf8"));
const current = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/armenia-villages.json"), "utf8"));

function normalize(s) {
  return s.normalize("NFC").toLowerCase().replace(/[\s\-՝().']+/g, "").trim();
}
const HY_MAP = {
  ա: "a", բ: "b", գ: "g", դ: "d", ե: "e", զ: "z", է: "e", ը: "y", թ: "t",
  ժ: "zh", ի: "i", լ: "l", խ: "kh", ծ: "ts", կ: "k", հ: "h", ձ: "dz", ղ: "gh",
  ճ: "ch", մ: "m", յ: "y", ն: "n", շ: "sh", ո: "vo", չ: "ch", պ: "p", ջ: "j",
  ռ: "r", ս: "s", վ: "v", տ: "t", ր: "r", ց: "ts", ւ: "u", փ: "p", ք: "k",
  օ: "o", ֆ: "f", և: "ev",
};
function armenianToLatin(str) {
  return str.toLowerCase().split("").map((ch) => HY_MAP[ch] ?? ch).join("");
}
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}
function threshold(len) {
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  return 3;
}

const byRegion = {};
for (const v of current) {
  (byRegion[v.regionSlug] = byRegion[v.regionSlug] || []).push({
    ...v,
    isLatinFallback: v.nameHy === v.nameEn,
    normHy: normalize(v.nameHy),
    normEn: normalize(v.nameEn),
  });
}

// When two of our own entries in the same region share the exact same
// Armenian name (typically a city and a rural village that happen to be
// called the same thing, e.g. Masis city vs. Masis village), only the
// smaller-population one is allowed to compete for the official registry's
// single slot for that name — the larger one is almost always the
// excluded-from-the-registry city/town.
const excluded = new Set();
for (const pool of Object.values(byRegion)) {
  const byName = new Map();
  for (const v of pool) {
    if (v.isLatinFallback) continue;
    if (!byName.has(v.normHy)) byName.set(v.normHy, []);
    byName.get(v.normHy).push(v);
  }
  for (const group of byName.values()) {
    if (group.length < 2) continue;
    group.sort((a, b) => (a.population ?? Infinity) - (b.population ?? Infinity));
    for (const loser of group.slice(1)) excluded.add(loser.slug);
  }
}

// Manual overrides for collisions the exact-name dedup above can't catch on
// its own, because one side's nameHy is itself a Latin fallback (GeoNames
// had no Armenian alternate name for that specific record):
// - masis-ararat (pop 23136) is the marz-capital city; the official
//   "Մասիս" is the separate ~1,500-person village.
// - artik-shirak (pop 18145) is Shirak's second city; excluding it lets the
//   real, much smaller official village "Արևիկ" (Arevik) show up as
//   genuinely missing from our data instead of being misassigned to the
//   city by loose fuzzy matching.
excluded.add("masis-ararat");
excluded.add("artik-shirak");

const triples = [];
for (const [regionSlug, names] of Object.entries(official)) {
  const pool = (byRegion[regionSlug] || []).filter((v) => !excluded.has(v.slug));
  for (const officialName of names) {
    const officialNorm = normalize(officialName);
    const officialLatin = normalize(armenianToLatin(officialName));
    const thresh = threshold(officialNorm.length);
    for (const v of pool) {
      if (v.isLatinFallback) {
        const d = levenshtein(v.normEn, officialLatin) + 1; // translit penalty
        if (d <= thresh + 1) triples.push({ regionSlug, officialName, v, d });
      } else {
        const d = levenshtein(v.normHy, officialNorm);
        if (d <= thresh) triples.push({ regionSlug, officialName, v, d });
      }
    }
  }
}

// Resolve lowest-distance pairs first, globally, not in official-list
// order — otherwise a loose fuzzy match for one official name can steal the
// correct candidate for a different, textually-similar official name
// before that name gets its turn (observed with e.g. Արևշատ vs Զարիշատ).
triples.sort((a, b) => a.d - b.d || (a.v.population ?? Infinity) - (b.v.population ?? Infinity));

const claimedOfficial = new Set();
const usedSlugs = new Set();
for (const t of triples) {
  const key = `${t.regionSlug}|${t.officialName}`;
  if (claimedOfficial.has(key) || usedSlugs.has(t.v.slug)) continue;
  claimedOfficial.add(key);
  usedSlugs.add(t.v.slug);
}

const kept = current.filter((v) => usedSlugs.has(v.slug));
console.log(`Kept ${kept.length} of ${current.length} (removed ${current.length - kept.length} not in the official registry)`);

const missingCount = Object.values(official).flat().length - claimedOfficial.size;
console.log(`${missingCount} official villages have no match in our data (not touched by this script)`);

fs.writeFileSync(path.join(ROOT, "src/data/armenia-villages.json"), JSON.stringify(kept, null, 2));
