"use client";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L from "leaflet";
import { GeoJSON, MapContainer, Marker, Popup, Tooltip, useMap, useMapEvent } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Feature, FeatureCollection } from "geojson";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import { pickLocalized } from "@/lib/localized";
import { STATUS_COLORS, type VillageMapItem } from "./types";

// Armenia bounding box (south, west, north, east) with a small margin, used to
// keep the map scoped to the country only (no tile layer / neighboring states).
const ARMENIA_BOUNDS: L.LatLngBoundsExpression = [
  [38.75, 43.4],
  [41.35, 46.65],
];

function slugifyShapeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

// Village dots shrink as you zoom in, so a busy area doesn't turn into a
// wall of overlapping circles once you're close enough to tell them apart.
const MIN_ZOOM_FOR_SIZE = 7;
const MAX_ZOOM_FOR_SIZE = 13;
const MAX_DOT_SIZE = 11;
const MIN_DOT_SIZE = 5;

// Below this zoom, most villages are still clustered and 1200+ permanent
// name labels would just be noise. Past it, clusters have mostly broken
// apart into individual dots, so a name next to each one stays readable.
const LABEL_MIN_ZOOM = 12;

function markerSizeForZoom(zoom: number): number {
  const t = Math.min(1, Math.max(0, (zoom - MIN_ZOOM_FOR_SIZE) / (MAX_ZOOM_FOR_SIZE - MIN_ZOOM_FOR_SIZE)));
  return Math.round(MAX_DOT_SIZE - t * (MAX_DOT_SIZE - MIN_DOT_SIZE));
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// The label is baked directly into the marker's HTML rather than using
// react-leaflet's <Tooltip permanent>, because a permanent tooltip bound to
// a marker living inside MarkerClusterGroup doesn't reliably auto-open when
// the cluster plugin (not React) decides to reveal that marker individually.
function villageIcon(color: string, size: number, label: string | null) {
  const half = size / 2;
  const dot = `<div style="position:absolute;left:0;top:0;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:1px solid var(--ink);box-shadow:0 0 0 1px rgba(239,125,31,0.35);"></div>`;
  const labelHtml = label
    ? `<div style="position:absolute;left:${size + 4}px;top:50%;transform:translateY(-50%);white-space:nowrap;background:rgba(23,19,15,0.85);color:#f7efe4;font-size:11px;line-height:1.5;padding:1px 5px;border-radius:4px;">${escapeHtml(label)}</div>`
    : "";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:${size}px;height:${size}px;">${dot}${labelHtml}</div>`,
    iconSize: [size, size],
    iconAnchor: [half, half],
  });
}

// Reads the region slug back off a hovered layer. For an individual
// village marker that's a custom option we stash on it; for a cluster
// bubble (which represents several markers, possibly from more than one
// region) we just use its first child as a reasonable guess.
type WithRegionSlug = { options?: { regionSlug?: string } };

function regionSlugForLayer(layer: L.Layer): string | null {
  const withChildren = layer as L.Layer & { getAllChildMarkers?: () => L.Marker[] };
  if (typeof withChildren.getAllChildMarkers === "function") {
    const child = withChildren.getAllChildMarkers()[0] as WithRegionSlug | undefined;
    return child?.options?.regionSlug ?? null;
  }
  return (layer as unknown as WithRegionSlug).options?.regionSlug ?? null;
}

function ZoomTracker({ onZoom }: { onZoom: (zoom: number) => void }) {
  const map = useMap();
  useEffect(() => {
    onZoom(map.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run once, on mount, to read the initial zoom
  }, []);
  useMapEvent("zoomend", () => onZoom(map.getZoom()));
  return null;
}

function clusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount();
  const size = count >= 100 ? 44 : count >= 25 ? 38 : 32;
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:var(--brand-apricot);color:var(--ink);
      display:flex;align-items:center;justify-content:center;
      font-weight:700;font-size:${size * 0.34}px;
      border:2px solid var(--ink);box-shadow:0 0 0 3px rgba(239,125,31,0.25);
    ">${count}</div>`,
    className: "",
    iconSize: [size, size],
  });
}

function FlyTo({ focus }: { focus: { lat: number; lng: number; zoom: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (focus) {
      map.flyTo([focus.lat, focus.lng], focus.zoom, { duration: 0.7 });
    } else {
      map.flyToBounds(ARMENIA_BOUNDS, { duration: 0.7, padding: [16, 16] });
    }
  }, [focus, map]);
  return null;
}

// Keeps the required OSM attribution text but drops Leaflet's own "🇺🇦
// Leaflet" branding prefix from the control.
function AttributionPrefixFix() {
  const map = useMap();
  useEffect(() => {
    map.attributionControl?.setPrefix(false);
  }, [map]);
  return null;
}

// Roads/rivers/water don't need to catch mouse events (that would steal
// hover/click from the region polygon underneath), and using a shared
// Canvas renderer instead of SVG keeps ~14,000 line/polygon features from
// turning into that many individual DOM nodes.
const ROAD_STYLE: Record<string, L.PathOptions> = {
  trunk: { color: "rgba(247,239,228,0.55)", weight: 2 },
  primary: { color: "rgba(247,239,228,0.45)", weight: 1.5 },
  secondary: { color: "rgba(247,239,228,0.32)", weight: 1 },
};
const ROAD_STYLE_DEFAULT: L.PathOptions = { color: "rgba(247,239,228,0.25)", weight: 1 };

const RIVER_STYLE: L.PathOptions = { color: "#4a90d9", weight: 1.2, opacity: 0.6 };
const WATER_STYLE: L.PathOptions = {
  color: "#4a90d9",
  weight: 1,
  fillColor: "#2f6fac",
  fillOpacity: 0.55,
};

export default function ArmeniaMap({
  villages,
  regionsGeo,
  roadsGeo,
  riversGeo,
  waterGeo,
  regionNameBySlug,
  activeRegionSlug,
  onRegionClick,
  focus,
  selectedVillageId,
  lang,
  dict,
}: {
  villages: VillageMapItem[];
  regionsGeo: FeatureCollection;
  roadsGeo: FeatureCollection;
  riversGeo: FeatureCollection;
  waterGeo: FeatureCollection;
  regionNameBySlug: Map<string, string>;
  activeRegionSlug: string | null;
  onRegionClick: (slug: string) => void;
  focus: { lat: number; lng: number; zoom: number } | null;
  selectedVillageId: string | null;
  lang: Locale;
  dict: Dictionary;
}) {
  const knownSlugs = useMemo(() => new Set(villages.map((v) => v.regionSlug)), [villages]);
  const renderer = useMemo(() => L.canvas({ padding: 0.5 }), []);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM_FOR_SIZE);
  const dotSize = markerSizeForZoom(zoom);
  const hoveredName = hoveredSlug ? regionNameBySlug.get(hoveredSlug) ?? null : null;

  useEffect(() => {
    if (!selectedVillageId) return;
    const marker = markerRefs.current.get(selectedVillageId);
    const cluster = clusterRef.current;
    if (marker && cluster) {
      cluster.zoomToShowLayer(marker, () => marker.openPopup());
    }
  }, [selectedVillageId]);

  function featureSlug(feature?: Feature): string {
    const name = (feature?.properties as { shapeName?: string } | undefined)?.shapeName ?? "";
    return slugifyShapeName(name);
  }

  const styleFor = useCallback(
    (feature?: Feature) => {
      const slug = featureSlug(feature);
      const interactive = knownSlugs.has(slug);
      const isActive = slug === activeRegionSlug;
      const isHovered = slug === hoveredSlug;
      return {
        color: isActive || isHovered ? "var(--on-ink)" : interactive ? "rgba(247,239,228,0.35)" : "rgba(247,239,228,0.25)",
        weight: isActive || isHovered ? 2.5 : 1.25,
        fillColor: "var(--ink-2)",
        fillOpacity: isHovered ? 0.75 : isActive ? 0.6 : interactive ? 0.35 : 0.5,
      };
    },
    [knownSlugs, activeRegionSlug, hoveredSlug]
  );

  const roadStyle = useCallback(
    (feature?: Feature): L.PathOptions => {
      const highway = (feature?.properties as { highway?: string } | undefined)?.highway ?? "";
      return { ...(ROAD_STYLE[highway] ?? ROAD_STYLE_DEFAULT), renderer, interactive: false };
    },
    [renderer]
  );
  const riverStyle = useCallback((): L.PathOptions => ({ ...RIVER_STYLE, renderer, interactive: false }), [renderer]);
  const waterStyle = useCallback((): L.PathOptions => ({ ...WATER_STYLE, renderer, interactive: false }), [renderer]);

  return (
    <div className="relative h-full w-full">
      {hoveredName && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] rounded-lg bg-ink/85 px-3 py-1.5 text-sm font-semibold text-on-ink shadow-lg">
          {hoveredName}
        </div>
      )}
      <MapContainer
        bounds={ARMENIA_BOUNDS}
        maxBounds={ARMENIA_BOUNDS}
        maxBoundsViscosity={0.9}
        minZoom={7}
        maxZoom={14}
        className="h-full w-full"
        zoomControl
      >
      <FlyTo focus={focus} />
      <ZoomTracker onZoom={setZoom} />
      <AttributionPrefixFix />
      <GeoJSON
        data={regionsGeo}
        style={styleFor}
        onEachFeature={(feature, layer) => {
          const slug = featureSlug(feature);
          if (knownSlugs.has(slug)) {
            layer.on("click", () => onRegionClick(slug));
            layer.on("mouseover", () => setHoveredSlug(slug));
            layer.on("mouseout", () => setHoveredSlug(null));
          }
        }}
      />
      <GeoJSON data={waterGeo} style={waterStyle} attribution="&copy; OpenStreetMap contributors" />
      <GeoJSON data={roadsGeo} style={roadStyle} />
      <GeoJSON data={riversGeo} style={riverStyle} />
      <MarkerClusterGroup
        ref={clusterRef}
        chunkedLoading
        iconCreateFunction={clusterIcon}
        spiderfyOnMaxZoom
        maxClusterRadius={50}
        showCoverageOnHover={false}
        onMouseOver={(e) => {
          const slug = regionSlugForLayer(e.layer);
          if (slug) setHoveredSlug(slug);
        }}
        onMouseOut={() => setHoveredSlug(null)}
      >
        {villages.map((v) => (
          <Marker
            key={v.id}
            position={[v.lat, v.lng]}
            icon={villageIcon(
              STATUS_COLORS[v.workoutStatus] ?? STATUS_COLORS.proposed,
              dotSize,
              zoom >= LABEL_MIN_ZOOM ? pickLocalized(v, "name", lang) : null
            )}
            ref={(instance) => {
              if (instance) {
                markerRefs.current.set(v.id, instance);
                (instance.options as { regionSlug?: string }).regionSlug = v.regionSlug;
              } else {
                markerRefs.current.delete(v.id);
              }
            }}
            eventHandlers={{
              mouseover: () => setHoveredSlug(v.regionSlug),
              mouseout: () => setHoveredSlug(null),
            }}
          >
            {zoom < LABEL_MIN_ZOOM && (
              <Tooltip direction="top" offset={[0, -8]} opacity={1} className="text-xs font-medium">
                {pickLocalized(v, "name", lang)}
              </Tooltip>
            )}
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{pickLocalized(v, "name", lang)}</div>
                <div className="mt-1 text-neutral-600">
                  {dict.village.workout_status[v.workoutStatus as keyof typeof dict.village.workout_status]}
                </div>
                <Link
                  href={`/${lang}/fund/${v.slug}`}
                  className="mt-2 inline-block font-semibold text-orange-700 underline"
                >
                  {dict.fund.view_village}
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
