import { useEffect, useState, type ReactNode } from "react";
import { Check, Copy, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  badge,
  aside,
  children,
  className,
}: {
  title: string;
  badge?: string;
  aside?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("glass rounded-3xl p-6 ring-1 ring-border", className)}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-sm font-semibold text-foreground">{title}</h2>
          {badge ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary ring-1 ring-primary/20">
              {badge}
            </span>
          ) : null}
        </div>
        {aside ? <span className="text-[11px] text-muted-foreground">{aside}</span> : null}
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-baseline justify-between text-[11px] tracking-wider text-muted-foreground uppercase">
        <span>{label}</span>
        {hint ? <span className="normal-case tracking-normal">{hint}</span> : null}
      </label>
      {children}
    </div>
  );
}

const fieldStyles =
  "well w-full rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/50";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldStyles, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(fieldStyles, "resize-y leading-relaxed", props.className)}
    />
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-lg px-2.5 py-1.5 text-xs capitalize transition-colors",
            option === value
              ? "bg-primary/15 text-primary ring-1 ring-primary/30"
              : "text-muted-foreground ring-1 ring-border hover:text-foreground",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "bg-lumen shadow-lumen font-display w-full rounded-xl py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40",
        props.className,
      )}
    >
      {children}
    </button>
  );
}

export function PriorityTag({ level }: { level: "High" | "Medium" | "Low" | "Focus" }) {
  const tone =
    level === "High"
      ? "bg-priority-high/15 text-priority-high ring-priority-high/25"
      : level === "Medium"
        ? "bg-priority-medium/15 text-priority-medium ring-priority-medium/25"
        : "bg-priority-low/15 text-priority-low ring-priority-low/25";
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs ring-1", tone)}>{level}</span>
  );
}

/** Output surface with Copy + Edit actions. */
export function OutputActions({
  text,
  editing,
  onToggleEdit,
  compact,
}: {
  text: string;
  editing: boolean;
  onToggleEdit: () => void;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const base = compact
    ? "flex-1 rounded-lg py-2 text-xs font-medium"
    : "flex-1 rounded-xl py-2.5 text-sm font-medium";

  return (
    <div className="mt-4 flex gap-2">
      <button
        type="button"
        onClick={copy}
        disabled={!text}
        className={cn(
          base,
          "font-display inline-flex items-center justify-center gap-2 bg-primary/10 text-primary ring-1 ring-primary/25 transition-colors hover:bg-primary/15 disabled:opacity-40",
        )}
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <button
        type="button"
        onClick={onToggleEdit}
        disabled={!text}
        className={cn(
          base,
          "font-display inline-flex items-center justify-center gap-2 text-foreground/70 ring-1 ring-border transition-colors hover:text-foreground disabled:opacity-40",
        )}
      >
        <Pencil className="size-3.5" />
        {editing ? "Done" : "Edit"}
      </button>
    </div>
  );
}

export function OutputSurface({
  value,
  editing,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  if (editing) {
    return (
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "well min-h-64 w-full flex-1 rounded-2xl p-5 text-sm leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "well min-h-64 flex-1 rounded-2xl p-5 text-sm leading-relaxed whitespace-pre-wrap text-foreground/85",
        className,
      )}
    >
      {value || <span className="text-muted-foreground">{placeholder}</span>}
    </div>
  );
}
