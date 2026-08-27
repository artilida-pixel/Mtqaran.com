import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { pickLocalized } from "@/lib/localized";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

export default async function LecturePage({
  params,
}: {
  params: Promise<{ lang: string; lectureSlug: string }>;
}) {
  const { lang, lectureSlug } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = await getDictionary(locale);

  const lecture = await prisma.lecture.findUnique({
    where: { slug: lectureSlug },
    include: { lecturer: true },
  });
  if (!lecture) notFound();

  const title = pickLocalized(lecture, "title", locale);
  const description = pickLocalized(lecture, "description", locale);
  const lecturerName = lecture.lecturer ? pickLocalized(lecture.lecturer, "name", locale) : dict.academy.channel_name;
  const embedUrl = lecture.videoUrl ? getYouTubeEmbedUrl(lecture.videoUrl) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href={`/${locale}/academy`} className="text-sm font-medium text-foreground">
        ← {dict.academy.back_to_lectures}
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {lecture.category && (
          <span className="rounded-full bg-brand-apricot/15 px-2.5 py-0.5 text-xs font-semibold text-brand-apricot-dark">
            {lecture.category}
          </span>
        )}
        {lecture.durationMin && (
          <span className="text-xs text-muted">
            {lecture.durationMin} {dict.common.min}
          </span>
        )}
      </div>

      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-muted">
        {dict.academy.source_label}: {lecturerName}
      </p>

      {embedUrl ? (
        <div className="mt-6 aspect-video overflow-hidden rounded-2xl border border-border bg-ink">
          <iframe
            src={embedUrl}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        lecture.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element -- external YouTube thumbnail
          <img src={lecture.coverImage} alt="" className="mt-6 w-full rounded-2xl border border-border" />
        )
      )}

      {description && <p className="mt-6 max-w-2xl text-muted">{description}</p>}
    </div>
  );
}
