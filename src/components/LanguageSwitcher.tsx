"use client";

import { useRouter, usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/lib/i18n";
import { setLocaleCookie } from "@/lib/cookies";

export default function LanguageSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(locale: Locale) {
    if (locale === current) return;
    setLocaleCookie(locale);
    const rest = pathname.split("/").slice(2).join("/");
    router.push(`/${locale}${rest ? `/${rest}` : ""}`);
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1 text-sm">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchTo(locale)}
          className={`rounded-full px-2.5 py-1 font-semibold transition-colors ${
            locale === current
              ? "bg-brand-apricot text-ink"
              : "text-on-ink-muted hover:text-on-ink"
          }`}
          aria-current={locale === current}
        >
          {locale.toUpperCase()}
        </button>
      ))}
      <span className="sr-only">{localeNames[current]}</span>
    </div>
  );
}
