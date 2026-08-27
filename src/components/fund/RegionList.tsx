"use client";

import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import { pickLocalized } from "@/lib/localized";
import { STATUS_COLORS, type RegionListItem } from "./types";

export default function RegionList({
  regions,
  expandedSlug,
  onToggleRegion,
  onVillageHover,
  lang,
  dict,
}: {
  regions: RegionListItem[];
  expandedSlug: string | null;
  onToggleRegion: (slug: string) => void;
  onVillageHover?: (villageId: string | null) => void;
  lang: Locale;
  dict: Dictionary;
}) {
  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
      {regions.map((region) => {
        const isOpen = expandedSlug === region.slug;
        return (
          <div key={region.id}>
            <button
              onClick={() => onToggleRegion(region.slug)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-medium">{pickLocalized(region, "name", lang)}</span>
              <span className="flex items-center gap-2 text-xs text-muted">
                {region.villages.length} {dict.fund.villages_count}
                <span className={`transition-transform ${isOpen ? "rotate-90" : ""}`}>›</span>
              </span>
            </button>
            {isOpen && (
              <ul className="max-h-72 space-y-1 overflow-y-auto px-4 pb-3">
                {region.villages.map((village) => (
                  <li key={village.id}>
                    <Link
                      href={`/${lang}/fund/${village.slug}`}
                      onMouseEnter={() => onVillageHover?.(village.id)}
                      onMouseLeave={() => onVillageHover?.(null)}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-background"
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: STATUS_COLORS[village.workoutStatus] ?? STATUS_COLORS.proposed }}
                      />
                      {pickLocalized(village, "name", lang)}
                    </Link>
                  </li>
                ))}
                {region.villages.length === 0 && (
                  <li className="px-2 py-1.5 text-sm text-muted">—</li>
                )}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
