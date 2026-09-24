import { useMemo, useState } from "react";
import { ArrowRight, Eraser, Eye } from "lucide-react";
import { DivisionWorksheet } from "@/components/DivisionWorksheet";
import { TfnWorksheet } from "@/components/TfnWorksheet";
import { GroupingWorksheet } from "@/components/GroupingWorksheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  baseName,
  digitsToBits,
  isValidInBase,
  parseInBase,
  stripLeadingZeros,
  toBase,
  type Base,
} from "@/lib/conversions";

type Kind = "division" | "tfn" | "group" | "bridge";

interface Conversion {
  id: string;
  from: Base;
  to: Base;
  kind: Kind;
  size?: 3 | 4;
  direction?: "toBinary" | "fromBinary";
}

const CONVERSIONS: Conversion[] = [
  { id: "dec-bin", from: 10, to: 2, kind: "division" },
  { id: "dec-oct", from: 10, to: 8, kind: "division" },
  { id: "dec-hex", from: 10, to: 16, kind: "division" },
  { id: "bin-dec", from: 2, to: 10, kind: "tfn" },
  { id: "oct-dec", from: 8, to: 10, kind: "tfn" },
  { id: "hex-dec", from: 16, to: 10, kind: "tfn" },
  { id: "bin-oct", from: 2, to: 8, kind: "group", size: 3, direction: "fromBinary" },
  { id: "oct-bin", from: 8, to: 2, kind: "group", size: 3, direction: "toBinary" },
  { id: "bin-hex", from: 2, to: 16, kind: "group", size: 4, direction: "fromBinary" },
  { id: "hex-bin", from: 16, to: 2, kind: "group", size: 4, direction: "toBinary" },
  { id: "oct-hex", from: 8, to: 16, kind: "bridge", size: 3 },
  { id: "hex-oct", from: 16, to: 8, kind: "bridge", size: 4 },
];

const METHOD: Record<Kind, string> = {
  division: "Divisiones sucesivas",
  tfn: "Teorema Fundamental de la Numeración",
  group: "Agrupación de bits",
  bridge: "Puente por binario",
};

export function Calculator({ onSolve }: { onSolve: (conversion: string, input: string, result: string) => void }) {
  const [activeId, setActiveId] = useState("dec-oct");
  const [raw, setRaw] = useState("136");
  const [submitted, setSubmitted] = useState("136");
  const [revealed, setRevealed] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const conversion = CONVERSIONS.find((c) => c.id === activeId)!;
  const valid = isValidInBase(submitted, conversion.from);
  const inputValid = isValidInBase(raw, conversion.from);

  const bridgeBinary = useMemo(() => {
    if (conversion.kind !== "bridge" || !valid) return "";
    const bits = digitsToBits(submitted, conversion.size!)
      .map((g) => g.bits)
      .join("");
    return stripLeadingZeros(bits);
  }, [conversion, submitted, valid]);

  function select(id: string) {
    setActiveId(id);
    setRevealed(false);
    setRaw("");
    setSubmitted("");
  }

  function resolve() {
    setRevealed(false);
    const v = raw.trim().toUpperCase();
    setSubmitted(v);
    if (isValidInBase(v, conversion.from)) {
      onSolve(
        `${baseName[conversion.from]} → ${baseName[conversion.to]}`,
        v,
        toBase(parseInBase(v, conversion.from), conversion.to),
      );
    }
  }

  return (
    <div>

        {/* Selector de conversiones */}
        <section>
          <h2 className="mb-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Apartados
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CONVERSIONS.map((c, i) => {
              const active = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => select(c.id)}
                  style={{ animationDelay: `${i * 35}ms` }}
                  className={cn(
                    "animate-fade-up group rounded-xl border px-4 py-4 text-left transition-all duration-300 hover:-translate-y-1",
                    active
                      ? "border-primary bg-primary/15 shadow-[var(--shadow-glow)]"
                      : "glass-panel hover:border-primary/50",
                  )}
                >
                  <div className="flex items-center gap-2 font-display text-base font-semibold">
                    {baseName[c.from]}
                    <ArrowRight
                      className={cn(
                        "size-4 transition-transform duration-300 group-hover:translate-x-1",
                        active ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    {baseName[c.to]}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{METHOD[c.kind]}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Panel de trabajo */}
        <section className="glass-panel animate-fade-up mt-12 rounded-3xl p-6 sm:p-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">
                De {baseName[conversion.from]} a {baseName[conversion.to]}
              </h2>
              <p className="text-sm text-muted-foreground">{METHOD[conversion.kind]}</p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="space-y-1.5">
                <span className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Número en base {conversion.from}
                </span>
                <input
                  value={raw}
                  onChange={(e) => setRaw(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && inputValid) resolve();
                  }}
                  placeholder={conversion.from === 16 ? "1A3" : "136"}
                  className={cn(
                    "h-11 w-40 rounded-lg border bg-secondary/60 px-3 font-mono text-lg outline-none transition-colors focus:ring-2 focus:ring-ring",
                    raw && !inputValid ? "border-destructive" : "border-input",
                  )}
                />
              </label>
              <Button onClick={resolve} disabled={!inputValid} size="lg">
                Empezar
              </Button>
            </div>
          </div>

          {raw && !inputValid ? (
            <p className="mt-3 text-sm text-destructive">
              En base {conversion.from} solo puedes usar estos símbolos:{" "}
              {"0123456789ABCDEF".slice(0, conversion.from).split("").join(" ")}
            </p>
          ) : null}

          <div className="mt-8 border-t border-border pt-8">
            {!valid ? (
              <p className="text-sm text-muted-foreground">
                Escribe un número arriba y pulsa <strong>Empezar</strong> para ver el
                desarrollo.
              </p>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-3xl font-bold">
                    {submitted}
                    <sub className="text-base text-muted-foreground">
                      {conversion.from}
                    </sub>
                  </span>
                  <ArrowRight className="size-5 text-primary" />
                  <span className="font-mono text-xl text-muted-foreground">
                    ?<sub className="text-base">{conversion.to}</sub>
                  </span>
                  <div className="ml-auto flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRevealed((r) => !r)}
                    >
                      <Eye className="size-4" />
                      {revealed ? "Ocultar solución" : "Ver solución"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRevealed(false);
                        setResetKey((k) => k + 1);
                      }}
                    >
                      <Eraser className="size-4" />
                      Borrar
                    </Button>
                  </div>
                </div>

                {conversion.kind === "division" ? (
                  <DivisionWorksheet
                    key={`${conversion.id}-${submitted}-${revealed}-${resetKey}`}
                    value={parseInBase(submitted, 10)}
                    base={conversion.to}
                    revealed={revealed}
                  />
                ) : null}

                {conversion.kind === "tfn" ? (
                  <TfnWorksheet
                    key={`${conversion.id}-${submitted}-${revealed}-${resetKey}`}
                    value={submitted}
                    base={conversion.from}
                    revealed={revealed}
                  />
                ) : null}

                {conversion.kind === "group" ? (
                  <GroupingWorksheet
                    key={`${conversion.id}-${submitted}-${revealed}-${resetKey}`}
                    value={submitted}
                    direction={conversion.direction!}
                    size={conversion.size!}
                    targetBase={conversion.to}
                    revealed={revealed}
                  />
                ) : null}

                {conversion.kind === "bridge" ? (
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Paso 1 · {baseName[conversion.from]} → Binario
                      </h3>
                      <GroupingWorksheet
                        key={`b1-${submitted}-${revealed}-${resetKey}`}
                        value={submitted}
                        direction="toBinary"
                        size={conversion.size!}
                        targetBase={2}
                        revealed={revealed}
                      />
                    </div>
                    <div className="space-y-4 border-t border-border pt-8">
                      <h3 className="text-lg font-semibold">
                        Paso 2 · Binario → {baseName[conversion.to]}
                      </h3>
                      <GroupingWorksheet
                        key={`b2-${submitted}-${revealed}-${resetKey}`}
                        value={bridgeBinary}
                        direction="fromBinary"
                        size={conversion.to === 16 ? 4 : 3}
                        targetBase={conversion.to}
                        revealed={revealed}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </section>

    </div>
  );
}
