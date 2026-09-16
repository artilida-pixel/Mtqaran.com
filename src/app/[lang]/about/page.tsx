import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { canonicalPath, localeAlternates, truncateForMeta } from "@/lib/seo";
import CornerArrowBadge from "@/components/CornerArrowBadge";

const PATH_SUFFIX = "/about";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const path = canonicalPath(lang, PATH_SUFFIX);
  const description = truncateForMeta(dict.about.p1);
  return {
    title: dict.about.hero_title,
    description,
    alternates: { canonical: path, languages: localeAlternates(PATH_SUFFIX) },
    openGraph: { title: dict.about.hero_title, description, url: path },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = await getDictionary(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:py-20">
      <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.3em] text-brand-apricot-dark">
        <span className="h-2 w-2 rounded-full bg-brand-apricot" />
        {dict.about.hero_kicker}
      </p>
      <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
        {dict.about.hero_title}
      </h1>

      <div className="mt-8 space-y-5 text-lg text-muted">
        <p>{dict.about.p1}</p>
        <p>{dict.about.p2}</p>
        <p>{dict.about.p3}</p>
      </div>

      <h2 className="mt-16 text-xl font-bold">{dict.about.directions_title}</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Link
          href={`/${locale}/academy`}
          prefetch={false}
          className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-8 shadow-sm transition-transform hover:-translate-y-1"
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
          className="group relative overflow-hidden rounded-3xl border border-ink bg-ink p-8 text-on-ink shadow-sm transition-transform hover:-translate-y-1"
        >
          <CornerArrowBadge />
          <span className="relative inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-apricot">
            {dict.home.fund_card_subtitle}
          </span>
          <h3 className="relative mt-5 text-2xl font-bold">{dict.home.fund_card_title}</h3>
          <p className="relative mt-3 text-on-ink-muted">{dict.home.fund_card_text}</p>
        </Link>
      </div>
    </div>
  );
}
