"use client";

// Which icon is visible is decided purely by CSS (see .theme-icon-light/dark
// in globals.css), driven by the data-theme attribute the blocking script in
// [lang]/layout.tsx sets before paint. No theme value lives in React state
// here — that value only exists client-side, so branching the rendered icon
// on it would mismatch the server-rendered HTML on every single page load.
export default function ThemeToggle() {
  function toggle() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    document.cookie = `theme=${next}; path=/; max-age=31536000`;
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-on-ink transition-colors hover:text-brand-apricot"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="theme-icon-dark h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="4.5" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.4 5.6l-1.5 1.5M7.1 16.9l-1.5 1.5M18.4 18.4l-1.5-1.5M7.1 7.1 5.6 5.6" />
        </g>
      </svg>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="theme-icon-light h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" fill="currentColor" />
      </svg>
    </button>
  );
}
