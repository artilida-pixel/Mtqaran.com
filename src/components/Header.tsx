import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import MountainMark from "./MountainMark";

export default function Header({
  lang,
  dict,
  theme,
}: {
  lang: Locale;
  dict: Dictionary;
  theme: "light" | "dark" | null;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-2 bg-ink text-on-ink">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href={`/${lang}`} className="flex flex-col items-center gap-1 py-1">
          <MountainMark className="h-10 w-16 text-on-ink" />
          <span className="text-sm font-extrabold uppercase tracking-wider">MTQARAN</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold uppercase tracking-wide md:flex">
          <Link
            href={`/${lang}/academy`}
            prefetch={false}
            className="text-on-ink-muted transition-colors hover:text-brand-apricot"
          >
            {dict.nav.academy}
          </Link>
          <Link
            href={`/${lang}/fund`}
            prefetch={false}
            className="text-on-ink-muted transition-colors hover:text-brand-apricot"
          >
            {dict.nav.fund}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle initialTheme={theme} />
          <LanguageSwitcher current={lang} />
        </div>
      </div>
    </header>
  );
}
