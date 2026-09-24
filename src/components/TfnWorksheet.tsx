import { useEffect, useState } from "react";
import { Blank, blankStatus } from "@/components/Blank";
import { ResultRow } from "@/components/ResultRow";
import { tfnTerms, type Base } from "@/lib/conversions";

interface Props {
  value: string;
  base: Base;
  revealed: boolean;
}

export function TfnWorksheet({ value, base, revealed }: Props) {
  const terms = tfnTerms(value, base);
  const [products, setProducts] = useState<string[]>([]);
  const [total, setTotal] = useState("");

  useEffect(() => {
    setProducts(terms.map(() => ""));
    setTotal("");
  }, [value, base, terms.length]);

  const sum = terms.reduce((a, t) => a + t.product, 0);
  const allOk =
    terms.every(
      (t, i) => blankStatus(products[i] ?? "", String(t.product), revealed) === "ok",
    ) && blankStatus(total, String(sum), revealed) === "ok";

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        Teorema Fundamental de la Numeración: cada dígito se multiplica por la base
        elevada a su posición, y se suma todo.
      </p>

      <div className="overflow-x-auto">
        <div className="min-w-[520px] space-y-3">
          {terms.map((t, i) => (
            <div
              key={i}
              className="animate-fade-up flex items-center gap-3 rounded-xl border border-border bg-secondary/30 px-4 py-3"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="font-mono text-2xl font-bold text-primary">{t.digit}</span>
              <span className="text-muted-foreground">×</span>
              <span className="font-mono text-xl">
                {base}
                <sup className="text-accent">{t.exponent}</sup>
              </span>
              <span className="text-muted-foreground">=</span>
              <span className="font-mono text-base text-muted-foreground">
                {t.digitValue} × {t.power} =
              </span>
              <Blank
                ariaLabel={`Producto del dígito ${t.digit}`}
                value={products[i] ?? ""}
                onChange={(v) => setProducts((p) => p.map((x, j) => (j === i ? v : x)))}
                expected={String(t.product)}
                revealed={revealed}
                className="w-24"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3">
        <span className="font-mono text-sm text-muted-foreground">
          {terms.map((t) => t.product).join(" + ")} =
        </span>
        <Blank
          ariaLabel="Suma total"
          value={total}
          onChange={setTotal}
          expected={String(sum)}
          revealed={revealed}
          className="w-28"
        />
      </div>

      <ResultRow digits={String(sum).split("")} base={10} visible={allOk} />
    </div>
  );
}
