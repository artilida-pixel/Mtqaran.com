import "server-only";
import type { Locale } from "@/lib/i18n";

const dictionaries = {
  hy: () => import("@/lib/dictionaries/hy.json").then((m) => m.default),
  ru: () => import("@/lib/dictionaries/ru.json").then((m) => m.default),
  en: () => import("@/lib/dictionaries/en.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["hy"]>>;

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();
