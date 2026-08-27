import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatAmd } from "@/lib/utils";
import MountainSkyline from "@/components/MountainSkyline";

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
      <section className="hero-ink relative overflow-hidden">
        <MountainSkyline className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-on-ink/15 sm:h-56" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 text-center sm:pt-24">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-apricot">
            {dict.home.hero_kicker}
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            {dict.home.hero_title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-on-ink-muted">
            {dict.home.hero_subtitle}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 -mt-10 pb-16 sm:grid-cols-2">
        <Link
          href={`/${locale}/academy`}
          className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-8 shadow-lg transition-transform hover:-translate-y-1"
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-apricot/15" />
          <span className="relative inline-block rounded-full bg-brand-orange-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-apricot-dark">
            {dict.nav.academy}
          </span>
          <h2 className="relative mt-4 text-2xl font-bold">{dict.home.academy_card_title}</h2>
          <p className="relative mt-3 text-muted">{dict.home.academy_card_text}</p>
          <span className="relative mt-6 inline-flex items-center gap-1 font-semibold text-brand-apricot-dark">
            {dict.home.academy_card_cta}
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </Link>

        <Link
          href={`/${locale}/fund`}
          className="group relative overflow-hidden rounded-3xl border border-ink bg-ink p-8 text-on-ink shadow-lg transition-transform hover:-translate-y-1"
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-apricot/25" />
          <span className="relative inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-apricot">
            {dict.home.fund_card_subtitle}
          </span>
          <h2 className="relative mt-4 text-2xl font-bold">{dict.home.fund_card_title}</h2>
          <p className="relative mt-3 text-on-ink-muted">{dict.home.fund_card_text}</p>
          <span className="relative mt-6 inline-flex items-center gap-1 font-semibold text-brand-apricot">
            {dict.home.fund_card_cta}
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </Link>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-12 text-center sm:grid-cols-4">
          <Stat value={villagesCount} label={dict.home.stats_villages} />
          <Stat value={regionsCount} label={dict.home.stats_regions} />
          <Stat value={lecturesCount} label={dict.home.stats_lectures} />
          <Stat value={formatAmd(4000000, locale)} label={dict.home.stats_goal} />
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div>
      <div className="text-3xl font-extrabold text-foreground">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}
