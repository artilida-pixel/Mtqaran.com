import { locales, defaultLocale, type Locale } from "@/lib/i18n";

export const SITE_URL = "https://mtqaran.am";

// Builds the hreflang alternate-language map for a locale-independent path
// suffix (e.g. "/academy/some-lecture", or "" for the homepage) — every
// locale of this same page, plus x-default pointing at the site's default
// locale, per Google's guidance for sites with no locale-neutral URL.
export function localeAlternates(pathSuffix: string): Record<string, string> {
  const entries = locales.map((l) => [l, `/${l}${pathSuffix}`] as const);
  return {
    ...Object.fromEntries(entries),
    "x-default": `/${defaultLocale}${pathSuffix}`,
  };
}

export function canonicalPath(locale: Locale, pathSuffix: string): string {
  return `/${locale}${pathSuffix}`;
}

// Meta descriptions should stay well under ~160 characters — our village
// history text can run to several paragraphs, so this cuts it to the last
// full word before the limit rather than slicing mid-word.
export function truncateForMeta(text: string, maxLength = 155): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= maxLength) return flat;
  const cut = flat.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}
