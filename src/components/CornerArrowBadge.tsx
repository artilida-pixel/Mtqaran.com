import ArrowIcon from "./ArrowIcon";

export default function CornerArrowBadge({ className }: { className?: string }) {
  return (
    <span
      className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand-apricot text-ink shadow-md transition-transform group-hover:rotate-45 ${className ?? ""}`}
    >
      <ArrowIcon className="h-4 w-4" direction="up-right" />
    </span>
  );
}
