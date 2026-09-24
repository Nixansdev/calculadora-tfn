import { cn } from "@/lib/utils";

interface BlankProps {
  value: string;
  onChange: (v: string) => void;
  expected: string;
  revealed: boolean;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

export function blankStatus(value: string, expected: string, revealed: boolean) {
  if (revealed) return "ok" as const;
  if (!value.trim()) return "idle" as const;
  return value.trim().toUpperCase() === expected.toUpperCase() ? "ok" : "bad";
}

export function Blank({
  value,
  onChange,
  expected,
  revealed,
  placeholder = "?",
  className,
  ariaLabel,
}: BlankProps) {
  const status = blankStatus(value, expected, revealed);
  const shown = revealed ? expected : value;

  return (
    <input
      value={shown}
      readOnly={revealed}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value.toUpperCase())}
      placeholder={placeholder}
      className={cn(
        "h-10 w-14 rounded-md border bg-secondary/60 text-center font-mono text-lg font-semibold outline-none transition-all duration-300 focus:ring-2 focus:ring-ring",
        status === "idle" && "border-input text-foreground",
        status === "ok" &&
          "animate-pop-in border-success bg-success/15 text-success shadow-[0_0_18px_-6px_var(--success)]",
        status === "bad" && "border-destructive bg-destructive/15 text-destructive",
        className,
      )}
    />
  );
}
