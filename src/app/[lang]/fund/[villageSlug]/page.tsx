import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n";
import { pickLocalized } from "@/lib/localized";
import { getVillageBySlug } from "@/lib/data";
import ProjectCard from "@/components/fund/ProjectCard";
import VillageSignBanner from "@/components/fund/VillageSignBanner";
import VillagePhotoGallery from "@/components/fund/VillagePhotoGallery";
import VillagePhotoForm from "@/components/fund/VillagePhotoForm";
import { canonicalPath, localeAlternates, truncateForMeta } from "@/lib/seo";

export const revalidate = 60;

// With no generateStaticParams at all, Next has no static shell to attach
// ISR to and just SSRs this route fresh on every request regardless of the
// `revalidate` above — an empty list is enough to opt in; dynamicParams
// defaults to true, so a village visited for the first time is generated
// on-demand and then served from cache like the rest, instead of ever
// eagerly building all ~950 villages × 3 locales at deploy time.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; villageSlug: string }>;
}): Promise<Metadata> {
  const { lang, villageSlug } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);

  const village = await getVillageBySlug(villageSlug);
  if (!village) return {};

  const name = pickLocalized(village, "name", lang);
  const regionName = pickLocalized(village.region, "name", lang);
  const rawDescription = pickLocalized(village, "description", lang);
  const description = truncateForMeta(rawDescription || `${name}, ${regionName}. ${dict.fund.hero_subtitle}`);
  const pathSuffix = `/fund/${villageSlug}`;
  const path = canonicalPath(lang, pathSuffix);

  return {
    title: `${name} — ${regionName}`,
    description,
    alternates: { canonical: path, languages: localeAlternates(pathSuffix) },
    openGraph: {
      title: name,
      description,
      url: path,
      images: village.coverImage ? [village.coverImage] : undefined,
    },
  };
}

export default async function VillagePage({
  params,
}: {
  params: Promise<{ lang: string; villageSlug: string }>;
}) {
  const { lang, villageSlug } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = await getDictionary(locale);

  const village = await getVillageBySlug(villageSlug);
  if (!village) notFound();

  const workoutProject = village.projects.find((p) => p.type === "workout_ground");
  const otherProjects = village.projects.filter((p) => p.type !== "workout_ground");
  const description = pickLocalized(village, "description", locale);
  const statusLabel =
    dict.village.workout_status[village.workoutStatus as keyof typeof dict.village.workout_status];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link href={`/${locale}/fund`} className="text-sm font-medium text-foreground">
        ← {dict.village.back_to_map}
      </Link>

      <div className="mt-4">
        {village.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- local static asset, pre-compressed at import time
          <img
            src={village.coverImage}
            alt={village.nameEn}
            className="aspect-[21/9] w-full rounded-2xl object-cover sm:aspect-[3/1]"
          />
        ) : (
          <VillageSignBanner nameHy={village.nameHy} nameEn={village.nameEn} />
        )}
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-brand-apricot-dark">
          {dict.village.region}: {pickLocalized(village.region, "name", locale)}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
          {pickLocalized(village, "name", locale)}
        </h1>
      </div>

      {description && (
        <div className="mt-4 max-w-3xl space-y-3 text-muted">
          {description.split(/\n{2,}/).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-xl font-bold">{dict.village.workout_project_title}</h2>
        <p className="mt-1 text-sm text-muted">{statusLabel}</p>
        {workoutProject ? (
          <div className="mt-4">
            <ProjectCard project={workoutProject} lang={locale} dict={dict} />
          </div>
        ) : (
          <p className="mt-4 text-muted">{dict.fund.select_region}</p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">{dict.village.other_projects_title}</h2>
        {otherProjects.length === 0 ? (
          <p className="mt-4 text-muted">{dict.village.no_other_projects}</p>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {otherProjects.map((project) => (
              <ProjectCard key={project.id} project={project} lang={locale} dict={dict} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">{dict.village.photos_title}</h2>
        {village.photos.length === 0 ? (
          <p className="mt-4 text-muted">{dict.village.photos_empty}</p>
        ) : (
          <div className="mt-4">
            <VillagePhotoGallery photos={village.photos} />
          </div>
        )}
        <div className="mt-5">
          <VillagePhotoForm villageId={village.id} dict={dict} />
        </div>
      </section>
    </div>
  );
}
