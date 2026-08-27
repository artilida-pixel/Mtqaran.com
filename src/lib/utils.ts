export function formatAmd(value: number, locale: string): string {
  const localeTag = locale === "hy" ? "hy-AM" : locale === "ru" ? "ru-RU" : "en-US";
  return new Intl.NumberFormat(localeTag).format(value);
}

export function progressPercent(raised: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}
