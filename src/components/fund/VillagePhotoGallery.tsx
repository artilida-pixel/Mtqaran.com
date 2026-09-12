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
          {/* eslint-disable-next-line @next/next/no-img-element -- served from our own DB-backed image route, not a build-time asset */}
          <img
            src={`/api/village-photos/${p.id}/image`}
            alt={p.caption ?? ""}
            className="aspect-[4/3] w-full object-cover"
            loading="lazy"
          />
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
