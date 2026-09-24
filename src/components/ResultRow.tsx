import { cn } from "@/lib/utils";
import type { Base } from "@/lib/conversions";

interface Props {
  digits: string[];
  base: Base | number;
  visible: boolean;
  label?: string;
}

export function ResultRow({ digits, base, visible, label = "Resultado" }: Props) {
  if (!visible) {
    return (
      <div className="rounded-xl border border-dashed border-border px-5 py-4 text-sm text-muted-foreground">
        Completa todos los huecos y aquí aparecerá el resultado final.
      </div>
    );
  }

  return (
    <div className="animate-fade-up flex flex-wrap items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-5 py-4">
      <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <span className="flex items-end gap-1">
        {digits.map((d, i) => (
          <span
            key={i}
            className={cn(
              "animate-pop-in font-mono text-3xl font-bold text-gradient",
            )}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            {d}
          </span>
        ))}
        <span className="mb-1 font-mono text-base text-muted-foreground">({base})</span>
      </span>
    </div>
  );
}
