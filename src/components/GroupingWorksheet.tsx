import { useEffect, useState } from "react";
import { Blank, blankStatus } from "@/components/Blank";
import { ResultRow } from "@/components/ResultRow";
import {
  digitsToBits,
  groupBits,
  stripLeadingZeros,
  type Base,
} from "@/lib/conversions";

interface Props {
  /** Valor de entrada ya validado, en mayúsculas. */
  value: string;
  /** "toBinary" = octal/hex -> binario, "fromBinary" = binario -> octal/hex */
  direction: "toBinary" | "fromBinary";
  size: 3 | 4;
  targetBase: Base;
  revealed: boolean;
}

export function GroupingWorksheet({
  value,
  direction,
  size,
  targetBase,
  revealed,
}: Props) {
  const groups = direction === "fromBinary" ? groupBits(value, size) : digitsToBits(value, size);
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    setAnswers(groups.map(() => ""));
  }, [value, direction, size, groups.length]);

  const expected = (i: number) =>
    direction === "fromBinary" ? groups[i]!.digit : groups[i]!.bits;

  const allOk = groups.every(
    (_, i) => blankStatus(answers[i] ?? "", expected(i), revealed) === "ok",
  );

  const resultDigits =
    direction === "fromBinary"
      ? stripLeadingZeros(groups.map((g) => g.digit).join("")).split("")
      : stripLeadingZeros(groups.map((g) => g.bits).join("")).split("");

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        {direction === "fromBinary" ? (
          <>
            Agrupa los bits de <span className="text-accent">{size} en {size}</span>{" "}
            empezando por la derecha (si falta, se rellena con ceros) y convierte cada
            grupo a su dígito.
          </>
        ) : (
          <>
            Cada dígito se sustituye por sus{" "}
            <span className="text-accent">{size} bits</span> y luego se juntan todos.
          </>
        )}
      </p>

      <div className="flex flex-wrap gap-4">
        {groups.map((g, i) => (
          <div
            key={i}
            className="animate-fade-up flex flex-col items-center gap-3 rounded-xl border border-border bg-secondary/30 px-4 py-4"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span className="font-mono text-2xl font-bold tracking-[0.15em] text-primary">
              {direction === "fromBinary" ? g.bits : g.digit}
            </span>
            <span className="text-xs text-muted-foreground">↓</span>
            <Blank
              ariaLabel={`Grupo ${i + 1}`}
              value={answers[i] ?? ""}
              onChange={(v) => setAnswers((p) => p.map((x, j) => (j === i ? v : x)))}
              expected={expected(i)}
              revealed={revealed}
              className={direction === "fromBinary" ? "w-14" : "w-24 tracking-[0.15em]"}
            />
          </div>
        ))}
      </div>

      <ResultRow
        digits={resultDigits}
        base={direction === "fromBinary" ? targetBase : 2}
        visible={allOk}
      />
    </div>
  );
}
