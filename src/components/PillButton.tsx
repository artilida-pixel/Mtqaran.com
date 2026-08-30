import Link from "next/link";
import type { ReactNode } from "react";
import ArrowIcon from "./ArrowIcon";

const VARIANTS = {
  dark: "bg-ink text-on-ink",
  light: "bg-[#f5f1e8] text-ink",
} as const;

const ARROW_VARIANTS = {
  dark: "bg-brand-apricot text-ink",
  light: "bg-brand-apricot text-ink",
} as const;

export default function PillButton({
  href,
  children,
  variant = "dark",
  prefetch,
}: {
  href: string;
  children: ReactNode;
  variant?: "dark" | "light";
  prefetch?: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={`group inline-flex items-center gap-3 rounded-full py-1.5 pl-5 pr-1.5 text-sm font-bold transition-transform hover:-translate-y-0.5 ${VARIANTS[variant]}`}
    >
      {children}
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5 ${ARROW_VARIANTS[variant]}`}
      >
        <ArrowIcon className="h-4 w-4" />
      </span>
    </Link>
  );
}
