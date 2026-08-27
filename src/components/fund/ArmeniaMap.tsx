"use client";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L from "leaflet";
import { GeoJSON, MapContainer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useEffect, useMemo, useRef } from "react";
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

function villageIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};border:2px solid var(--ink);
      box-shadow:0 0 0 2px rgba(239,125,31,0.35);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
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

export default function ArmeniaMap({
  villages,
  regionsGeo,
  activeRegionSlug,
  onRegionClick,
  focus,
  selectedVillageId,
  lang,
  dict,
}: {
  villages: VillageMapItem[];
  regionsGeo: FeatureCollection;
  activeRegionSlug: string | null;
  onRegionClick: (slug: string) => void;
  focus: { lat: number; lng: number; zoom: number } | null;
  selectedVillageId: string | null;
  lang: Locale;
  dict: Dictionary;
}) {
  const knownSlugs = useMemo(() => new Set(villages.map((v) => v.regionSlug)), [villages]);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

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

  function styleFor(feature?: Feature) {
    const slug = featureSlug(feature);
    const interactive = knownSlugs.has(slug);
    const isActive = slug === activeRegionSlug;
    return {
      color: isActive ? "var(--brand-apricot)" : interactive ? "rgba(239,125,31,0.55)" : "rgba(247,239,228,0.25)",
      weight: isActive ? 2.5 : 1.25,
      fillColor: isActive ? "var(--brand-apricot)" : "var(--ink-2)",
      fillOpacity: isActive ? 0.55 : interactive ? 0.35 : 0.5,
    };
  }

  return (
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
      <GeoJSON
        data={regionsGeo}
        style={styleFor}
        onEachFeature={(feature, layer) => {
          const slug = featureSlug(feature);
          const name = (feature.properties as { shapeName?: string } | undefined)?.shapeName ?? "";
          if (knownSlugs.has(slug)) {
            layer.bindTooltip(name, { sticky: true, className: "text-xs" });
            layer.on("click", () => onRegionClick(slug));
            layer.on("mouseover", () => (layer as L.Path).setStyle({ fillOpacity: 0.55 }));
            layer.on("mouseout", () =>
              (layer as L.Path).setStyle(styleFor(feature) as L.PathOptions)
            );
          }
        }}
      />
      <MarkerClusterGroup
        ref={clusterRef}
        chunkedLoading
        iconCreateFunction={clusterIcon}
        spiderfyOnMaxZoom
        maxClusterRadius={50}
        showCoverageOnHover={false}
      >
        {villages.map((v) => (
          <Marker
            key={v.id}
            position={[v.lat, v.lng]}
            icon={villageIcon(STATUS_COLORS[v.workoutStatus] ?? STATUS_COLORS.proposed)}
            ref={(instance) => {
              if (instance) markerRefs.current.set(v.id, instance);
              else markerRefs.current.delete(v.id);
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1} className="text-xs font-medium">
              {pickLocalized(v, "name", lang)}
            </Tooltip>
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
  );
}
