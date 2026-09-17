import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLatestNews, getLecturers } from "@/lib/data";
import { formatAmd } from "@/lib/utils";
import MountainSkyline from "@/components/MountainSkyline";
import MountainMark from "@/components/MountainMark";
import PillButton from "@/components/PillButton";
import CornerArrowBadge from "@/components/CornerArrowBadge";
import SocialLinks from "@/components/SocialLinks";
import NewsBlock from "@/components/home/NewsBlock";
import LecturersBlock from "@/components/home/LecturersBlock";
import { activeSocialLinks } from "@/lib/social";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 300;

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = await getDictionary(locale);

  const [villagesCount, regionsCount, lecturesCount, news, lecturers] = await Promise.all([
    prisma.village.count(),
    prisma.region.count(),
    prisma.lecture.count(),
    getLatestNews(3),
    getLecturers(),
  ]);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: "MTQARAN",
    url: `${SITE_URL}/${locale}`,
    logo: `${SITE_URL}/icon`,
    description: dict.meta.description,
    sameAs: activeSocialLinks.map((l) => l.href),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      {/* --- Hero --- */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.3em] text-brand-apricot-dark">
              <span className="h-2 w-2 rounded-full bg-brand-apricot" />
              {dict.home.hero_kicker}
            </p>
            <h1 className="mt-5 max-w-xl text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              {dict.home.hero_title}
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted">{dict.home.hero_subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <PillButton href={`/${locale}/academy`} prefetch={false}>
                {dict.home.academy_card_cta}
              </PillButton>
              <PillButton href={`/${locale}/fund`} prefetch={false}>
                {dict.home.fund_card_cta}
              </PillButton>
            </div>
          </div>

          <div className="hero-ink relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl">
            <MountainSkyline className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 w-full text-on-ink/20" />
            <MountainMark className="absolute left-1/2 top-1/2 h-24 w-40 -translate-x-1/2 -translate-y-1/2 text-on-ink/90" />
            <div className="absolute left-4 top-4 flex flex-col items-center justify-center rounded-full bg-brand-apricot px-4 py-3 text-center leading-tight text-ink shadow-lg">
              <span className="text-lg font-extrabold">{villagesCount}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide">{dict.home.stats_villages}</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- Mission --- */}
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="space-y-4 text-lg text-muted">
          <p>{dict.about.p1}</p>
          <p>{dict.about.p2}</p>
          <p>{dict.about.p3}</p>
        </div>
        <Link
          href={`/${locale}/about`}
          prefetch={false}
          className="mt-6 inline-flex items-center gap-1 font-semibold text-brand-apricot-dark transition-colors hover:text-brand-apricot"
        >
          {dict.nav.about}
          <span aria-hidden="true">→</span>
        </Link>
      </section>

      {/* --- 1. News: its own tinted band, so it reads as a separate section --- */}
      <NewsBlock items={news} locale={locale} dict={dict} />

      {/* --- 2 + 3. Academy and the villages, deliberately inside one frame --- */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-extrabold tracking-tight">{dict.home.directions_title}</h2>
        <div className="mt-8 rounded-[28px] border border-border bg-surface p-2 shadow-sm">
          <div className="grid gap-2 sm:grid-cols-5">
            <Link
              href={`/${locale}/academy`}
              prefetch={false}
              className="group relative col-span-2 overflow-hidden rounded-3xl p-8 transition-colors hover:bg-brand-orange-soft/50"
            >
              <CornerArrowBadge />
              <span className="relative inline-block rounded-full bg-brand-orange-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-apricot-dark">
                {dict.nav.academy}
              </span>
              <h3 className="relative mt-5 text-2xl font-bold">{dict.home.academy_card_title}</h3>
              <p className="relative mt-3 text-muted">{dict.home.academy_card_text}</p>
            </Link>

            <Link
              href={`/${locale}/fund`}
              prefetch={false}
              className="group relative col-span-3 overflow-hidden rounded-3xl bg-ink p-8 text-on-ink transition-transform hover:-translate-y-0.5"
            >
              <CornerArrowBadge />
              <span className="relative inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-apricot">
                {dict.home.fund_card_subtitle}
              </span>
              <h3 className="relative mt-5 text-2xl font-bold">{dict.home.fund_card_title}</h3>
              <p className="relative mt-3 max-w-md text-on-ink-muted">{dict.home.fund_card_text}</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-12 text-center sm:grid-cols-4">
          <Stat value={villagesCount} label={dict.home.stats_villages} />
          <Stat value={regionsCount} label={dict.home.stats_regions} />
          <Stat value={lecturesCount} label={dict.home.stats_lectures} />
          <Stat value={formatAmd(4000000, locale)} label={dict.home.stats_goal} />
        </div>
      </section>

      {/* --- 4. Lecturers --- */}
      <LecturersBlock lecturers={lecturers} locale={locale} dict={dict} />

      {/* --- 5. Social accounts --- */}
      {activeSocialLinks.length > 0 && (
        <section className="hero-ink relative overflow-hidden">
          <MountainSkyline className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 w-full text-on-ink/10" />
          <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-14 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight">{dict.home.social_title}</h2>
            <SocialLinks
              className="mt-6 justify-center"
              itemClassName="border-white/25 text-on-ink hover:border-brand-apricot hover:text-brand-apricot"
            />
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div>
      <div className="flex items-center justify-center gap-2 text-3xl font-extrabold text-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-apricot" />
        {value}
      </div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}
