import Image from "next/image";

type GalleryPhoto = {
  id: string;
  caption: string | null;
  submittedBy: string | null;
};

export default function VillagePhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((p) => (
        <figure key={p.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="relative aspect-[4/3] w-full">
            <Image
              // A DB-backed route rather than a build-time asset, so there are
              // no intrinsic dimensions to import — `fill` inside the fixed
              // 4:3 box reserves the space instead. Only approved photos ever
              // reach this gallery, so the optimizer (which fetches without
              // the admin cookie) can read them.
              src={`/api/village-photos/${p.id}/image`}
              alt={p.caption ?? ""}
              fill
              // 3 columns inside the max-w-5xl column past lg, 2 columns
              // between sm and lg, full width on phones.
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
              className="object-cover"
            />
          </div>
          {(p.caption || p.submittedBy) && (
            <figcaption className="p-3 text-sm">
              {p.caption && <p className="text-foreground">{p.caption}</p>}
              {p.submittedBy && <p className="mt-1 text-xs text-muted">— {p.submittedBy}</p>}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
