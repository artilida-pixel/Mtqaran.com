import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatAmd } from "@/lib/utils";
import MountainSkyline from "@/components/MountainSkyline";
import MountainMark from "@/components/MountainMark";
import PillButton from "@/components/PillButton";
import CornerArrowBadge from "@/components/CornerArrowBadge";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = await getDictionary(locale);

  const [villagesCount, regionsCount, lecturesCount] = await Promise.all([
    prisma.village.count(),
    prisma.region.count(),
    prisma.lecture.count(),
  ]);

  return (
    <div>
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

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-6 sm:grid-cols-5">
          <Link
            href={`/${locale}/academy`}
            prefetch={false}
            className="group relative col-span-2 overflow-hidden rounded-3xl border border-border bg-surface p-8 shadow-sm transition-transform hover:-translate-y-1"
          >
            <CornerArrowBadge />
            <span className="relative inline-block rounded-full bg-brand-orange-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-apricot-dark">
              {dict.nav.academy}
            </span>
            <h2 className="relative mt-5 text-2xl font-bold">{dict.home.academy_card_title}</h2>
            <p className="relative mt-3 text-muted">{dict.home.academy_card_text}</p>
          </Link>

          <Link
            href={`/${locale}/fund`}
            prefetch={false}
            className="group relative col-span-3 overflow-hidden rounded-3xl border border-ink bg-ink p-8 text-on-ink shadow-sm transition-transform hover:-translate-y-1"
          >
            <CornerArrowBadge />
            <span className="relative inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-apricot">
              {dict.home.fund_card_subtitle}
            </span>
            <h2 className="relative mt-5 text-2xl font-bold">{dict.home.fund_card_title}</h2>
            <p className="relative mt-3 max-w-md text-on-ink-muted">{dict.home.fund_card_text}</p>
          </Link>
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-12 text-center sm:grid-cols-4">
          <Stat value={villagesCount} label={dict.home.stats_villages} />
          <Stat value={regionsCount} label={dict.home.stats_regions} />
          <Stat value={lecturesCount} label={dict.home.stats_lectures} />
          <Stat value={formatAmd(4000000, locale)} label={dict.home.stats_goal} />
        </div>
      </section>

      <section className="hero-ink relative overflow-hidden">
        <MountainSkyline className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 w-full text-on-ink/10" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            {dict.home.fund_card_subtitle}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-on-ink-muted">{dict.home.fund_card_text}</p>
          <div className="mt-8 flex justify-center">
            <PillButton href={`/${locale}/fund`} variant="light" prefetch={false}>
              {dict.home.fund_card_cta}
            </PillButton>
          </div>
        </div>
      </section>
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
