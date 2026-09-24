import { useEffect, useState } from "react";
import { Blank, blankStatus } from "@/components/Blank";
import { ResultRow } from "@/components/ResultRow";
import {
  divisionResultDigits,
  divisionSteps,
  type Base,
} from "@/lib/conversions";

interface Props {
  value: number;
  base: Base;
  revealed: boolean;
}

export function DivisionWorksheet({ value, base, revealed }: Props) {
  const steps = divisionSteps(value, base);
  const [quotients, setQuotients] = useState<string[]>([]);
  const [remainders, setRemainders] = useState<string[]>([]);

  useEffect(() => {
    setQuotients(steps.map(() => ""));
    setRemainders(steps.map(() => ""));
  }, [value, base, steps.length]);

  const qOk = (i: number) =>
    blankStatus(
      quotients[i] ?? "",
      steps[i]!.quotient.toString(base).toUpperCase(),
      revealed,
    ) === "ok";
  const rOk = (i: number) =>
    blankStatus(remainders[i] ?? "", String(steps[i]!.remainder), revealed) === "ok";

  const allOk = steps.every((_, i) => qOk(i) && rOk(i));
  const digits = divisionResultDigits(value, base);

  if (steps.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {value} es menor que {base}, así que no hace falta dividir: el número ya es un
          solo dígito en esta base.
        </p>
        <ResultRow digits={digits} base={base} visible />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        Divide entre <span className="font-mono text-primary">{base}</span> una y otra
        vez. En cada división escribe el <span className="text-accent">cociente</span> y
        el <span className="text-accent">resto</span>. Cuando el cociente sea menor que{" "}
        {base}, paras.
      </p>

      <div className="space-y-6">
        {steps.map((step, i) => {
          const unlocked = i === 0 || qOk(i - 1);
          return (
            <div
              key={i}
              className={
                unlocked
                  ? "animate-fade-up"
                  : "pointer-events-none select-none opacity-30 blur-[2px]"
              }
            >
              <div className="flex items-start gap-3">
                <span className="mt-2 font-mono text-xs text-muted-foreground">
                  {i + 1}.
                </span>
                <div className="inline-grid grid-cols-[auto_auto] gap-x-0">
                  {/* Dividendo */}
                  <div className="flex h-10 items-center justify-end pr-3 font-mono text-2xl font-bold">
                    {step.dividend}
                  </div>
                  {/* Divisor, con la rayita */}
                  <div className="flex h-10 items-center border-b-2 border-l-2 border-primary/70 pl-3 pr-2 font-mono text-2xl font-bold text-primary">
                    {step.divisor}
                  </div>
                  {/* Resto */}
                  <div className="flex items-center justify-end gap-2 pr-3 pt-2">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      resto
                    </span>
                    <Blank
                      ariaLabel={`Resto de ${step.dividend} entre ${step.divisor}`}
                      value={remainders[i] ?? ""}
                      onChange={(v) =>
                        setRemainders((prev) => prev.map((x, j) => (j === i ? v : x)))
                      }
                      expected={String(step.remainder)}
                      revealed={revealed}
                    />
                  </div>
                  {/* Cociente */}
                  <div className="flex items-center gap-2 border-l-2 border-primary/70 pl-3 pt-2">
                    <Blank
                      ariaLabel={`Cociente de ${step.dividend} entre ${step.divisor}`}
                      value={quotients[i] ?? ""}
                      onChange={(v) =>
                        setQuotients((prev) => prev.map((x, j) => (j === i ? v : x)))
                      }
                      expected={String(step.quotient)}
                      revealed={revealed}
                    />
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      cociente
                    </span>
                  </div>
                </div>
              </div>
              {i < steps.length - 1 && qOk(i) ? (
                <p className="mt-3 pl-8 text-xs text-muted-foreground">
                  El cociente {step.quotient} sigue siendo ≥ {base}: vuelvo a dividir.
                </p>
              ) : null}
              {i === steps.length - 1 && qOk(i) ? (
                <p className="mt-3 pl-8 text-xs text-muted-foreground">
                  El cociente {step.quotient} ya es menor que {base}: aquí paro.
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Se lee el <span className="text-accent">último cociente</span> y después los{" "}
          <span className="text-accent">restos de abajo hacia arriba</span>:
        </p>
        <ResultRow digits={digits} base={base} visible={allOk} />
      </div>
    </div>
  );
}
