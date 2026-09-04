import { cn } from "@/lib/utils";

export function DonezaLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary shadow-lumen">
        <svg
          viewBox="0 0 24 24"
          className="size-6 text-primary-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 12 L9 17 L20 6" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="font-display text-xl leading-none font-bold tracking-tight text-foreground">
          Done
          <span className="text-[1.12em] font-extrabold text-foreground">
            ZA
          </span>
        </p>
        <p className="mt-1.5 text-[11px] leading-snug text-primary">
          Your day, DoneZA.
        </p>
      </div>
    </div>
  );
}
