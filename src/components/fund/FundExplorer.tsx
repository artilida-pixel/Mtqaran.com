"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { FeatureCollection } from "geojson";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import { pickLocalized } from "@/lib/localized";
import RegionList from "./RegionList";
import VillageSearch from "./VillageSearch";
import type { RegionListItem, VillageMapItem } from "./types";

const ArmeniaMap = dynamic(() => import("./ArmeniaMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-ink-2" />,
});

export default function FundExplorer({
  regions,
  regionsGeo,
  lang,
  dict,
}: {
  regions: RegionListItem[];
  regionsGeo: FeatureCollection;
  lang: Locale;
  dict: Dictionary;
}) {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [selectedVillageId, setSelectedVillageId] = useState<string | null>(null);

  const villages = useMemo(() => regions.flatMap((r) => r.villages), [regions]);
  const regionNameBySlug = useMemo(
    () => new Map(regions.map((r) => [r.slug, pickLocalized(r, "name", lang)])),
    [regions, lang]
  );

  function toggleRegion(slug: string) {
    setExpandedSlug((cur) => (cur === slug ? null : slug));
  }

  function selectVillage(village: VillageMapItem) {
    setExpandedSlug(village.regionSlug);
    setSelectedVillageId(village.id);
  }

  const focus = useMemo(() => {
    if (!expandedSlug) return null;
    const region = regions.find((r) => r.slug === expandedSlug);
    if (!region) return null;
    return { lat: region.lat, lng: region.lng, zoom: 10 };
  }, [expandedSlug, regions]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="h-[420px] overflow-hidden rounded-2xl border border-ink-2 lg:h-[560px]">
        <ArmeniaMap
          villages={villages}
          regionsGeo={regionsGeo}
          activeRegionSlug={expandedSlug}
          onRegionClick={toggleRegion}
          focus={focus}
          selectedVillageId={selectedVillageId}
          lang={lang}
          dict={dict}
        />
      </div>
      <div>
        <VillageSearch
          villages={villages}
          regionNameBySlug={regionNameBySlug}
          lang={lang}
          dict={dict}
          onSelect={selectVillage}
        />
        <h2 className="mb-3 mt-5 text-lg font-bold">{dict.fund.regions_title}</h2>
        <RegionList
          regions={regions}
          expandedSlug={expandedSlug}
          onToggleRegion={toggleRegion}
          lang={lang}
          dict={dict}
        />
      </div>
    </div>
  );
}
