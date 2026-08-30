import MountainSkyline from "@/components/MountainSkyline";

// A road-sign-style banner used as every village's card face. Real photos
// per village aren't available, and AI-generating one for 1223 villages
// would routinely mangle the text (especially Armenian script) — this
// renders the actual name from the database instead, so it's always
// correct, and matches how real Armenian village signs are bilingual
// (Armenian above, Latin transliteration below).
export default function VillageSignBanner({ nameHy, nameEn }: { nameHy: string; nameEn: string }) {
  return (
    <div className="hero-ink relative aspect-[21/9] w-full overflow-hidden rounded-2xl sm:aspect-[3/1]">
      <MountainSkyline className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 w-full text-on-ink/20" />
      <div className="relative flex h-full items-center justify-center p-6">
        <div className="rounded-md border-[3px] border-ink bg-[#f5f1e8] px-5 py-2.5 text-center shadow-xl sm:px-8 sm:py-4">
          <div className="text-xl font-extrabold leading-tight tracking-wide text-ink sm:text-3xl">{nameHy}</div>
          <div className="mt-1 text-xs font-bold uppercase tracking-[0.15em] text-ink/75 sm:text-base">
            {nameEn}
          </div>
        </div>
      </div>
    </div>
  );
}
