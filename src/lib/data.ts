import { cache } from "react";
import { prisma } from "@/lib/prisma";

// generateMetadata and the page component both need the same row — cache()
// dedupes the two Prisma calls into one per request instead of querying twice.
export const getVillageBySlug = cache(async (slug: string) => {
  return prisma.village.findUnique({
    where: { slug },
    include: {
      region: true,
      projects: { where: { status: { in: ["active", "completed"] } }, orderBy: { createdAt: "asc" } },
      photos: { where: { status: "approved" }, orderBy: { createdAt: "desc" }, omit: { imageData: true } },
    },
  });
});

export const getLectureBySlug = cache(async (slug: string) => {
  return prisma.lecture.findUnique({
    where: { slug },
    include: { lecturer: true },
  });
});
