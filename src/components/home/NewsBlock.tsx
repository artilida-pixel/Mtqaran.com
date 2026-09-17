import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import { pickLocalizedOrAny } from "@/lib/localized";

type NewsCard = {
  id: string;
  publishedAt: Date;
  mimeType: string | null;
  sourceUrl: string | null;
  titleHy: string | null;
  titleRu: string | null;
  titleEn: string | null;
  bodyHy: string | null;
  bodyRu: string | null;
  bodyEn: string | null;
};

const dateLocales: Record<Locale, string> = { hy: "hy-AM", ru: "ru-RU", en: "en-US" };

export default function NewsBlock({
  items,
  locale,
  dict,
}: {
  items: NewsCard[];
  locale: Locale;
  dict: Dictionary;
}) {
  if (items.length === 0) return null;

  return (
    <section className="border-y border-brand-apricot/30 bg-band">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-apricot" />
          {dict.home.news_title}
        </h2>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const title = pickLocalizedOrAny(item, "title", locale);
            const body = pickLocalizedOrAny(item, "body", locale);

            return (
              <article
                key={item.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
              >
                {item.mimeType && (
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={`/api/news/${item.id}/image`}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <time
                    dateTime={item.publishedAt.toISOString()}
                    className="text-xs font-semibold uppercase tracking-wide text-brand-apricot-dark"
                  >
                    {item.publishedAt.toLocaleDateString(dateLocales[locale], {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                  <h3 className="mt-2 text-lg font-bold leading-snug">{title}</h3>
                  {body && (
                    // Posts are pasted straight out of Telegram, so single
                    // line breaks are meaningful — keep them, and cap the card
                    // at six lines so one long post can't tower over the rest.
                    <p className="mt-2 line-clamp-6 whitespace-pre-line text-sm text-muted">{body}</p>
                  )}
                  {item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-apricot-dark transition-colors hover:text-brand-apricot"
                    >
                      {dict.home.news_read_more}
                      <span aria-hidden="true">→</span>
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
