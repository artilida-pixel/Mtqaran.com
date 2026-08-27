"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import { pickLocalized } from "@/lib/localized";
import type { VillageMapItem } from "./types";

export default function VillageSearch({
  villages,
  regionNameBySlug,
  lang,
  dict,
  onSelect,
}: {
  villages: VillageMapItem[];
  regionNameBySlug: Map<string, string>;
  lang: Locale;
  dict: Dictionary;
  onSelect: (village: VillageMapItem) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return villages.filter((v) =>
      [v.nameHy, v.nameRu, v.nameEn].some((n) => n.toLowerCase().includes(q))
    );
  }, [villages, query]);

  const visible = results.slice(0, 8);
  const extra = results.length - visible.length;

  function select(v: VillageMapItem) {
    onSelect(v);
    setQuery(pickLocalized(v, "name", lang));
    setOpen(false);
  }

  return (
    <div className="relative">
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={dict.fund.search_placeholder}
          className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-apricot"
        />
      </div>
      {open && query.trim() && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
          {visible.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">{dict.fund.search_no_results}</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {visible.map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => select(v)}
                    className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm hover:bg-background"
                  >
                    <span>{pickLocalized(v, "name", lang)}</span>
                    <span className="text-xs text-muted">{regionNameBySlug.get(v.regionSlug)}</span>
                  </button>
                </li>
              ))}
              {extra > 0 && (
                <li className="px-4 py-2 text-xs text-muted">
                  {dict.fund.search_more.replace("{count}", String(extra))}
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
