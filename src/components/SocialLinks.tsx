import { activeSocialLinks, type SocialNetwork } from "@/lib/social";

// Simple, recognisable glyphs drawn from primitives rather than copies of the
// official brand logos — they read correctly at 20-24px, which is the only
// size they are ever used at, and they inherit the surrounding text colour.
function SocialIcon({ network }: { network: SocialNetwork }) {
  const common = { className: "h-5 w-5", viewBox: "0 0 24 24", "aria-hidden": true } as const;

  if (network === "telegram") {
    return (
      <svg {...common} fill="currentColor">
        <path d="M21.5 3.6 2.9 10.8c-.8.3-.8 1.4 0 1.7l4.5 1.5 1.7 5.2c.2.7 1.1.9 1.6.4l2.5-2.4 4.5 3.3c.6.4 1.4.1 1.6-.6l3.3-15c.2-.8-.6-1.5-1.1-1.3ZM9.6 14.2l-.3 3.4-1.1-3.5 9.2-6-7.8 6.1Z" />
      </svg>
    );
  }

  if (network === "instagram") {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (network === "youtube") {
    return (
      <svg {...common} fill="currentColor">
        <path d="M22.5 7.9a3 3 0 0 0-2.1-2.1C18.6 5.3 12 5.3 12 5.3s-6.6 0-8.4.5A3 3 0 0 0 1.5 7.9C1 9.7 1 12 1 12s0 2.3.5 4.1a3 3 0 0 0 2.1 2.1c1.8.5 8.4.5 8.4.5s6.6 0 8.4-.5a3 3 0 0 0 2.1-2.1c.5-1.8.5-4.1.5-4.1s0-2.3-.5-4.1ZM9.9 15.4V8.6l5.8 3.4-5.8 3.4Z" />
      </svg>
    );
  }

  return (
    <svg {...common} fill="currentColor">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.8 3.7-3.8 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

export default function SocialLinks({
  className = "",
  itemClassName = "",
}: {
  className?: string;
  itemClassName?: string;
}) {
  if (activeSocialLinks.length === 0) return null;

  return (
    <ul className={`flex flex-wrap items-center gap-3 ${className}`}>
      {activeSocialLinks.map((link) => (
        <li key={link.network}>
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={link.label}
            title={link.label}
            className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${itemClassName}`}
          >
            <SocialIcon network={link.network} />
          </a>
        </li>
      ))}
    </ul>
  );
}
