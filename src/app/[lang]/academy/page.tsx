import { getDictionary } from "@/lib/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LecturerCard from "@/components/academy/LecturerCard";
import LectureCard from "@/components/academy/LectureCard";
import MountainSkyline from "@/components/MountainSkyline";

export default async function AcademyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = await getDictionary(locale);

  const [lecturers, lectures] = await Promise.all([
    prisma.lecturer.findMany({ orderBy: { order: "asc" } }),
    prisma.lecture.findMany({
      include: { lecturer: true },
      orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
    }),
  ]);

  const lecturerById = new Map(lecturers.map((l) => [l.id, l]));

  return (
    <div>
      <section className="hero-ink relative overflow-hidden">
        <MountainSkyline className="pointer-events-none absolute inset-x-0 bottom-0 h-32 w-full text-on-ink/15 sm:h-44" />
        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-16 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-apricot">{dict.nav.academy}</p>
          <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-extrabold tracking-tight">{dict.academy.hero_title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-on-ink-muted">{dict.academy.hero_subtitle}</p>
        </div>
      </section>

      {lecturers.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl font-bold">{dict.academy.lecturers_title}</h2>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {lecturers.map((lecturer) => (
              <LecturerCard key={lecturer.id} lecturer={lecturer} lang={locale} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-bold">{dict.academy.lectures_title}</h2>
        {lectures.length === 0 ? (
          <p className="mt-6 text-muted">{dict.academy.coming_soon}</p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {lectures.map((lecture) => (
              <LectureCard
                key={lecture.id}
                lecture={lecture}
                lecturer={lecture.lecturerId ? lecturerById.get(lecture.lecturerId) : undefined}
                lang={locale}
                dict={dict}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
