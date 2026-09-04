import fs from "fs";
import path from "path";
import sharp from "sharp";

// One-off/repeatable tool: takes a folder of "<registry-number> <Armenian
// name>.png" village photos (as exported from the government registry
// numbering), matches each to a village in armenia-villages.json by name
// (fuzzy, in case of minor spelling differences), and writes a compressed
// JPEG into public/villages/<slug>.jpg plus a coverImage-update list.
//
// Usage: node scripts/import-village-photos.mjs <photo-folder> [regionSlug]
// If regionSlug is omitted, matches against villages from every region.

const ROOT = path.resolve(import.meta.dirname, "..");
const photoDir = process.argv[2];
const regionFilter = process.argv[3];
if (!photoDir) {
  console.error("Usage: node scripts/import-village-photos.mjs <photo-folder> [regionSlug]");
  process.exit(1);
}

const PUBLIC_DIR = path.join(ROOT, "public/villages");
const VILLAGES_JSON = path.join(ROOT, "src/data/armenia-villages.json");

// Non-ASCII folder names (e.g. an Armenian/Cyrillic marz name from an
// extracted zip) can get mangled passing through a shell's argv encoding —
// if the given path doesn't exist but has exactly one subdirectory, descend
// into that instead of failing.
function resolvePhotoDir(dir) {
  if (fs.existsSync(dir)) return dir;
  const parent = path.dirname(dir);
  const entries = fs.readdirSync(parent, { withFileTypes: true }).filter((e) => e.isDirectory());
  if (entries.length === 1) return path.join(parent, entries[0].name);
  throw new Error(`Cannot resolve photo dir "${dir}" and parent has ${entries.length} subdirectories`);
}

function normalize(s) {
  return s.normalize("NFC").toLowerCase().replace(/[\s\-՝().']+/g, "").trim();
}
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

const villages = JSON.parse(fs.readFileSync(VILLAGES_JSON, "utf8"));
const candidates = regionFilter ? villages.filter((v) => v.regionSlug === regionFilter) : villages;

const resolvedPhotoDir = resolvePhotoDir(photoDir);
const files = fs.readdirSync(resolvedPhotoDir).filter((f) => /\.(png|jpg|jpeg)$/i.test(f));
console.log("Photo files:", files.length, "| candidate villages:", candidates.length);

const parsed = files.map((f) => {
  const m = f.match(/^(\d+)\s+(.+)\.(png|jpg|jpeg)$/i);
  return m ? { file: f, num: parseInt(m[1], 10), name: m[2] } : { file: f, num: null, name: f.replace(/\.(png|jpg|jpeg)$/i, "") };
});

const matched = [];
const unmatched = [];
for (const p of parsed) {
  const pNorm = normalize(p.name);
  let best = null;
  let bestDist = Infinity;
  for (const v of candidates) {
    const d = levenshtein(normalize(v.nameHy), pNorm);
    if (d < bestDist) {
      bestDist = d;
      best = v;
    }
  }
  const threshold = pNorm.length <= 5 ? 1 : pNorm.length <= 9 ? 2 : 3;
  if (best && bestDist <= threshold) matched.push({ ...p, slug: best.slug, villageNameHy: best.nameHy, dist: bestDist });
  else unmatched.push({ ...p, closest: best?.nameHy, dist: bestDist });
}

console.log("Matched:", matched.length, "Unmatched:", unmatched.length);
for (const u of unmatched) console.log("  UNMATCHED:", u.file, "| closest guess:", u.closest, "dist:", u.dist);
for (const m of matched.filter((m) => m.dist > 0)) console.log("  fuzzy:", m.name, "->", m.villageNameHy, "dist", m.dist);

const seenSlugs = new Set();
const toProcess = [];
for (const m of matched) {
  if (seenSlugs.has(m.slug)) {
    console.log("  DUPLICATE MATCH, skipping:", m.file, "-> slug already used:", m.slug);
    continue;
  }
  seenSlugs.add(m.slug);
  toProcess.push(m);
}

fs.mkdirSync(PUBLIC_DIR, { recursive: true });

const results = [];
for (const m of toProcess) {
  const buf = fs.readFileSync(path.join(resolvedPhotoDir, m.file));
  const destPath = path.join(PUBLIC_DIR, `${m.slug}.jpg`);
  await sharp(buf).resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true }).toFile(destPath);
  const stat = fs.statSync(destPath);
  results.push({ slug: m.slug, sizeKb: Math.round(stat.size / 1024) });
  console.log("Processed:", m.slug, `${Math.round(stat.size / 1024)}KB`);
}

console.log("\nTotal processed:", results.length);

// Update armenia-villages.json in place with coverImage paths
let updated = 0;
for (const v of villages) {
  if (seenSlugs.has(v.slug)) {
    v.coverImage = `/villages/${v.slug}.jpg`;
    updated++;
  }
}
fs.writeFileSync(VILLAGES_JSON, JSON.stringify(villages, null, 2));
console.log("Updated coverImage for", updated, "villages in armenia-villages.json");
