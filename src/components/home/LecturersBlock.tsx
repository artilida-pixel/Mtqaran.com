import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import { pickLocalizedOrAny } from "@/lib/localized";

type LecturerCard = {
  id: string;
  photo: string | null;
  photoMime: string | null;
  telegram: string | null;
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  website: string | null;
  nameHy: string;
  nameRu: string;
  nameEn: string;
  titleHy: string | null;
  titleRu: string | null;
  titleEn: string | null;
  bioHy: string | null;
  bioRu: string | null;
  bioEn: string | null;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function LecturersBlock({
  lecturers,
  locale,
  dict,
}: {
  lecturers: LecturerCard[];
  locale: Locale;
  dict: Dictionary;
}) {
  if (lecturers.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-3xl font-extrabold tracking-tight">{dict.home.lecturers_title}</h2>
      <p className="mt-3 max-w-xl text-muted">{dict.home.lecturers_text}</p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {lecturers.map((lecturer) => {
          const name = pickLocalizedOrAny(lecturer, "name", locale);
          const title = pickLocalizedOrAny(lecturer, "title", locale);
          const bio = pickLocalizedOrAny(lecturer, "bio", locale);
          // An uploaded portrait lives in the database and is served by the
          // API route; a seeded one is just a path in `photo`.
          const photoSrc = lecturer.photoMime ? `/api/lecturers/${lecturer.id}/photo` : lecturer.photo;
          const links = [
            { label: "Telegram", href: lecturer.telegram },
            { label: "Instagram", href: lecturer.instagram },
            { label: "Facebook", href: lecturer.facebook },
            { label: "YouTube", href: lecturer.youtube },
            { label: dict.nav.contact, href: lecturer.website },
          ].filter((l): l is { label: string; href: string } => Boolean(l.href));

          return (
            <article
              key={lecturer.id}
              className="flex flex-col items-center rounded-3xl border border-border bg-surface p-6 text-center shadow-sm"
            >
              {photoSrc ? (
                <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-brand-orange-soft">
                  <Image
                    src={photoSrc}
                    alt={name}
                    fill
                    sizes="112px"
                    // A seeded `photo` could be an off-site URL, which the
                    // optimizer refuses unless the host is whitelisted — skip
                    // optimizing those rather than breaking the card.
                    unoptimized={!photoSrc.startsWith("/")}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-brand-orange-soft bg-brand-orange-soft text-2xl font-extrabold text-brand-apricot-dark">
                  {initials(name)}
                </div>
              )}

              <h3 className="mt-4 text-lg font-bold">{name}</h3>
              {title && <p className="mt-1 text-sm font-semibold text-brand-apricot-dark">{title}</p>}
              {bio && <p className="mt-3 whitespace-pre-line text-sm text-muted">{bio}</p>}

              {links.length > 0 && (
                <ul className="mt-4 flex flex-wrap justify-center gap-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted transition-colors hover:border-brand-apricot hover:text-brand-apricot-dark"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
