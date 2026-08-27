import type { Locale } from "@/lib/i18n";
import { pickLocalized } from "@/lib/localized";
import type { LecturerModel } from "@/generated/prisma/models";

export default function LecturerCard({ lecturer, lang }: { lecturer: LecturerModel; lang: Locale }) {
  const name = pickLocalized(lecturer, "name", lang);
  const title = pickLocalized(lecturer, "title", lang);
  const bio = pickLocalized(lecturer, "bio", lang);
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-surface p-6 text-center shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full ring-4 ring-brand-orange-soft">
        {lecturer.photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- lecturer photo may be an external URL
          <img src={lecturer.photo} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-ink text-xl font-bold text-on-ink">
            {initials || "?"}
          </div>
        )}
      </div>
      <h3 className="mt-4 font-semibold">{name}</h3>
      {title && <p className="mt-1 text-sm text-brand-apricot-dark">{title}</p>}
      {bio && <p className="mt-2 text-sm text-muted">{bio}</p>}
    </div>
  );
}
