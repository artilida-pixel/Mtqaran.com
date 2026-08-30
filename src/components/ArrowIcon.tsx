export default function ArrowIcon({
  className,
  direction = "right",
}: {
  className?: string;
  direction?: "right" | "up-right";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ transform: direction === "up-right" ? "rotate(-45deg)" : undefined }}
      aria-hidden="true"
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
