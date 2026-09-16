import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { locales, defaultLocale } from "@/lib/i18n";
import { SITE_URL, canonicalPath } from "@/lib/seo";

function absoluteAlternates(pathSuffix: string) {
  const entries = locales.map((l) => [l, `${SITE_URL}${canonicalPath(l, pathSuffix)}`] as const);
  return {
    languages: {
      ...Object.fromEntries(entries),
      "x-default": `${SITE_URL}${canonicalPath(defaultLocale, pathSuffix)}`,
    },
  };
}

function entriesFor(
  pathSuffix: string,
  lastModified: Date,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number
): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: `${SITE_URL}${canonicalPath(locale, pathSuffix)}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: absoluteAlternates(pathSuffix),
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [villages, lectures] = await Promise.all([
    prisma.village.findMany({ select: { slug: true, createdAt: true } }),
    prisma.lecture.findMany({ select: { slug: true, createdAt: true } }),
  ]);

  const now = new Date();

  return [
    ...entriesFor("", now, "weekly", 1),
    ...entriesFor("/about", now, "monthly", 0.7),
    ...entriesFor("/academy", now, "weekly", 0.8),
    ...entriesFor("/fund", now, "daily", 0.8),
    ...lectures.flatMap((l) => entriesFor(`/academy/${l.slug}`, l.createdAt, "monthly", 0.6)),
    ...villages.flatMap((v) => entriesFor(`/fund/${v.slug}`, v.createdAt, "monthly", 0.5)),
  ];
}
