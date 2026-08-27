import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import MountainMark from "./MountainMark";

export default function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <footer className="mt-24 border-t border-ink-2 bg-ink text-on-ink-muted">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2 font-extrabold uppercase tracking-wider text-on-ink">
            <MountainMark className="h-6 w-9" />
            MTQARAN
          </span>
          <p>{dict.footer.made_for}</p>
        </div>
        <p className="mt-4">
          © {new Date().getFullYear()} MTQARAN. {dict.footer.rights}
        </p>
        <p className="mt-1 text-xs opacity-60">/{lang}</p>
      </div>
    </footer>
  );
}
