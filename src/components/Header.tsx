import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import MountainMark from "./MountainMark";

export default function Header({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-2 bg-ink text-on-ink">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3">
        <Link href={`/${lang}`} className="justify-self-start">
          <MountainMark className="h-10 w-16 text-on-ink" />
        </Link>

        <Link
          href={`/${lang}`}
          className="justify-self-center text-lg font-extrabold uppercase tracking-[0.15em] sm:text-2xl"
        >
          Mtqaran Foundation
        </Link>

        <div className="flex items-center justify-self-end gap-6">
          <nav className="hidden items-center gap-8 text-sm font-semibold uppercase tracking-wide md:flex">
            <Link
              href={`/${lang}/about`}
              prefetch={false}
              className="text-on-ink-muted transition-colors hover:text-brand-apricot"
            >
              {dict.nav.about}
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher current={lang} />
          </div>
        </div>
      </div>
    </header>
  );
}
