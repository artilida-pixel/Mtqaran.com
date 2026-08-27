export default function MountainSkyline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 420"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M-20 420 L120 260 L210 330 L340 150 L430 240 L560 90 L680 260 L760 200 L900 340 L1010 220 L1120 340 L1220 260 L1220 420 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M340 150 L430 240 L520 210 Z" fill="var(--brand-apricot)" stroke="none" opacity="0.9" />
      <path d="M560 90 L680 260 L620 230 Z" fill="var(--brand-apricot)" stroke="none" opacity="0.5" />
    </svg>
  );
}
