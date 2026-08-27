import { getDictionary } from "@/lib/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FundExplorer from "@/components/fund/FundExplorer";
import ProjectCard from "@/components/fund/ProjectCard";
import { pickLocalized } from "@/lib/localized";
import type { RegionListItem } from "@/components/fund/types";
import { getArmeniaRegionsGeoJson } from "@/lib/armeniaGeo";

export default async function FundPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = await getDictionary(locale);

  const regionsRaw = await prisma.region.findMany({
    include: { villages: true },
    orderBy: { nameEn: "asc" },
  });

  const regions: RegionListItem[] = regionsRaw.map((r) => ({
    id: r.id,
    slug: r.slug,
    nameHy: r.nameHy,
    nameRu: r.nameRu,
    nameEn: r.nameEn,
    lat: r.lat,
    lng: r.lng,
    villages: r.villages.map((v) => ({
      id: v.id,
      slug: v.slug,
      regionSlug: r.slug,
      nameHy: v.nameHy,
      nameRu: v.nameRu,
      nameEn: v.nameEn,
      lat: v.lat,
      lng: v.lng,
      workoutStatus: v.workoutStatus,
    })),
  }));

  const activeProjects = await prisma.project.findMany({
    where: { status: "active" },
    include: { village: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const regionsGeo = getArmeniaRegionsGeoJson();

  return (
    <div>
      <section className="hero-ink relative overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-16 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-apricot">{dict.fund.hero_kicker}</p>
          <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-extrabold tracking-tight">{dict.fund.hero_title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-on-ink-muted">{dict.fund.hero_subtitle}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <FundExplorer regions={regions} regionsGeo={regionsGeo} lang={locale} dict={dict} />
      </section>

      {activeProjects.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl font-bold">{dict.fund.active_projects_title}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activeProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                lang={locale}
                dict={dict}
                villageName={pickLocalized(project.village, "name", locale)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
