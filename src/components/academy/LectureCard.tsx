import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { pickLocalized } from "@/lib/localized";
import type { Dictionary } from "@/lib/dictionaries";
import type { LectureModel, LecturerModel } from "@/generated/prisma/models";
import ArrowIcon from "@/components/ArrowIcon";

export default function LectureCard({
  lecture,
  lecturer,
  lang,
  dict,
}: {
  lecture: LectureModel;
  lecturer?: LecturerModel;
  lang: Locale;
  dict: Dictionary;
}) {
  const title = pickLocalized(lecture, "title", lang);
  const description = pickLocalized(lecture, "description", lang);
  const lecturerName = lecturer ? pickLocalized(lecturer, "name", lang) : dict.academy.channel_name;

  return (
    <Link
      href={`/${lang}/academy/${lecture.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-lg"
    >
      {lecture.coverImage && (
        <div className="relative aspect-video overflow-hidden bg-ink">
          {/* eslint-disable-next-line @next/next/no-img-element -- external YouTube thumbnail, not a build-time asset */}
          <img
            src={lecture.coverImage}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-ink/20 transition-colors group-hover:bg-ink/35">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-apricot text-ink shadow-lg">
              <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-5 w-5">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
          {lecture.durationMin && (
            <span className="absolute bottom-2 right-2 rounded bg-ink/80 px-1.5 py-0.5 text-xs font-medium text-on-ink">
              {lecture.durationMin} {dict.common.min}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          {lecture.category && (
            <span className="rounded-full bg-brand-apricot px-2.5 py-0.5 text-xs font-bold text-ink">
              {lecture.category}
            </span>
          )}
          {lecture.featured && (
            <span className="rounded-full bg-brand-apricot/15 px-2.5 py-0.5 text-xs font-semibold text-brand-apricot-dark">
              ★
            </span>
          )}
        </div>
        <h3 className="mt-3 font-semibold leading-snug">{title}</h3>
        {description && <p className="mt-2 flex-1 text-sm text-muted">{description}</p>}
        <div className="mt-4 flex items-center justify-between text-xs text-muted">
          <span>{lecturerName}</span>
          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
            {dict.academy.watch}
            <ArrowIcon className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
