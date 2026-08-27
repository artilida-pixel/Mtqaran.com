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
