import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Armenian } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { SITE_URL, canonicalPath, localeAlternates } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const notoSans = Noto_Sans({
  subsets: ["latin", "cyrillic"],
  variable: "--font-noto-sans",
  display: "swap",
});

const notoSansArmenian = Noto_Sans_Armenian({
  subsets: ["armenian"],
  variable: "--font-noto-sans-armenian",
  display: "swap",
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

const OG_LOCALE: Record<Locale, string> = { hy: "hy_AM", ru: "ru_RU", en: "en_US" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const locale: Locale = lang;
  const dict = await getDictionary(locale);
  const path = canonicalPath(locale, "");

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: dict.meta.title,
      template: "%s — MTQARAN",
    },
    description: dict.meta.description,
    alternates: {
      canonical: path,
      languages: localeAlternates(""),
    },
    openGraph: {
      type: "website",
      siteName: "MTQARAN",
      locale: OG_LOCALE[locale],
      title: dict.meta.title,
      description: dict.meta.description,
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
    },
  };
}

// Reads the theme choice from the cookie synchronously, before first paint,
// so the page never flashes the wrong theme. This has to run client-side —
// reading the cookie on the server (as this layout used to) forces every
// page under it into per-request dynamic rendering, which is why the whole
// site was un-cacheable. When there's no cookie, this does nothing and
// globals.css's prefers-color-scheme media query takes over.
const THEME_INIT_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )theme=(dark|light)/);if(m)document.documentElement.setAttribute('data-theme',m[1]);}catch(e){}`;

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = await getDictionary(locale);
  const dir = "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${notoSans.variable} ${notoSansArmenian.variable}`}
    >
      <head>
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="flex min-h-screen flex-col">
          <Header lang={locale} dict={dict} />
          <main className="flex-1">{children}</main>
          <Footer lang={locale} dict={dict} />
        </div>
      </body>
    </html>
  );
}
