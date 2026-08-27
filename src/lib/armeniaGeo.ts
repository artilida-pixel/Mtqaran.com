import "server-only";
import fs from "fs";
import path from "path";
import type { FeatureCollection } from "geojson";

let cached: FeatureCollection | null = null;

export function getArmeniaRegionsGeoJson(): FeatureCollection {
  if (cached) return cached;
  const filePath = path.join(process.cwd(), "src/data/armenia-regions.geojson");
  const raw = fs.readFileSync(filePath, "utf8");
  cached = JSON.parse(raw) as FeatureCollection;
  return cached;
}
