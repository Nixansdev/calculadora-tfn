import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { listHistory } from "@/lib/app.functions";

type Row = Awaited<ReturnType<typeof listHistory>>[number];

export function HistoryPanel({ token, isAdmin }: { token: string; isAdmin: boolean }) {
  const list = useServerFn(listHistory);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [all, setAll] = useState(isAdmin);

  useEffect(() => {
    setRows(null);
    list({ data: { token, all } }).then(setRows).catch(() => setRows([]));
  }, [list, token, all]);

  return (
    <section className="glass-panel animate-fade-up rounded-3xl p-6 sm:p-9">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Historial de ecuaciones</h2>
        {isAdmin ? (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} />
            Ver de todos los alumnos
          </label>
        ) : null}
      </div>
      {rows === null ? (
        <p className="text-muted-foreground">Cargando…</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground">Aún no hay operaciones guardadas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {all ? <th className="py-2 pr-4">Alumno</th> : null}
                <th className="py-2 pr-4">Conversión</th>
                <th className="py-2 pr-4">Número</th>
                <th className="py-2 pr-4">Resultado</th>
                <th className="py-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  {all ? <td className="py-2 pr-4">{r.user}</td> : null}
                  <td className="py-2 pr-4">{r.conversion}</td>
                  <td className="py-2 pr-4 font-mono">{r.input}</td>
                  <td className="py-2 pr-4 font-mono text-primary">{r.result}</td>
                  <td className="py-2 text-muted-foreground">
                    {new Date(r.created_at).toLocaleString("es-ES")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
