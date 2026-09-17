import type { Locale } from "@/lib/i18n";

type LocalizedRecord = Record<string, unknown>;

export function pickLocalized<T extends LocalizedRecord>(
  record: T,
  field: string,
  locale: Locale
): string {
  const key = `${field}${locale.charAt(0).toUpperCase()}${locale.slice(1)}`;
  const value = record[key];
  return typeof value === "string" ? value : "";
}

// Same as `pickLocalized`, but falls back to whatever other language the row
// does have instead of rendering an empty string. News items and lecturer
// profiles are typed in by hand — usually by pasting a Telegram post that
// exists in one language only — so demanding all three would mean either
// empty cards or fake translations.
export function pickLocalizedOrAny<T extends LocalizedRecord>(
  record: T,
  field: string,
  locale: Locale,
  fallbackOrder: readonly Locale[] = ["hy", "ru", "en"]
): string {
  const own = pickLocalized(record, field, locale);
  if (own) return own;
  for (const l of fallbackOrder) {
    const value = pickLocalized(record, field, l);
    if (value) return value;
  }
  return "";
}
