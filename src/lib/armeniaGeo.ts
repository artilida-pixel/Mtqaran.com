import "server-only";
import fs from "fs";
import path from "path";
import type { FeatureCollection } from "geojson";

const cache = new Map<string, FeatureCollection>();

function loadGeoJson(fileName: string): FeatureCollection {
  const cached = cache.get(fileName);
  if (cached) return cached;
  const filePath = path.join(process.cwd(), "src/data", fileName);
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw) as FeatureCollection;
  cache.set(fileName, parsed);
  return parsed;
}

export function getArmeniaRegionsGeoJson(): FeatureCollection {
  return loadGeoJson("armenia-regions.geojson");
}

// Roads (trunk/primary/secondary) and standing water, sourced from
// OpenStreetMap via the Overpass API and clipped to Armenia's own admin
// boundary (not a bounding box, so no neighboring-country data leaks in).
// Geometry is simplified (~150m tolerance) to keep the map smooth with a
// few thousand features on top of everything else it already renders. Water
// is trimmed to Lake Sevan only — the smaller reservoirs/ponds cluttered the
// map without adding much at this zoom range.
export function getArmeniaRoadsGeoJson(): FeatureCollection {
  return loadGeoJson("armenia-roads.geojson");
}

export function getArmeniaWaterGeoJson(): FeatureCollection {
  return loadGeoJson("armenia-water.geojson");
}
