import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  adminCreateAdmin,
  adminListUsers,
  adminSetPassword,
  adminToggleActive,
} from "@/lib/app.functions";

type U = Awaited<ReturnType<typeof adminListUsers>>[number];
const inputCls =
  "h-10 rounded-lg border border-input bg-secondary/60 px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

export function ManageUsers({ token, meId }: { token: string; meId: string }) {
  const list = useServerFn(adminListUsers);
  const create = useServerFn(adminCreateAdmin);
  const setPass = useServerFn(adminSetPassword);
  const toggle = useServerFn(adminToggleActive);
  const [users, setUsers] = useState<U[] | null>(null);
  const [name, setName] = useState("");
  const [pass, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = useCallback(() => {
    list({ data: { token } }).then(setUsers).catch(() => setUsers([]));
  }, [list, token]);
  useEffect(refresh, [refresh]);

  async function addAdmin() {
    setMsg(null);
    try {
      const r = await create({ data: { token, name, password: pass } });
      if (!r.ok) return setMsg(r.error ?? "Error");
      setName("");
      setPassword("");
      setMsg("Administrador creado.");
      refresh();
    } catch {
      setMsg("Nombre (mín. 3) y contraseña (mín. 4) obligatorios.");
    }
  }

  async function resetPass(u: U) {
    const p = window.prompt(`Nueva contraseña para ${u.full_name}:`);
    if (!p) return;
    try {
      await setPass({ data: { token, userId: u.id, password: p } });
      refresh();
    } catch {
      alert("La contraseña debe tener al menos 4 caracteres.");
    }
  }

  return (
    <section className="glass-panel animate-fade-up space-y-8 rounded-3xl p-6 sm:p-9">
      <h2 className="text-2xl font-semibold">Manage Users</h2>

      <div className="space-y-3 rounded-2xl border border-border p-4">
        <h3 className="font-semibold">Crear administrador</h3>
        <div className="flex flex-wrap gap-2">
          <input className={inputCls} placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={inputCls} placeholder="Contraseña" value={pass} onChange={(e) => setPassword(e.target.value)} />
          <Button onClick={addAdmin}>Crear</Button>
        </div>
        {msg ? <p className="text-sm text-muted-foreground">{msg}</p> : null}
      </div>

      {users === null ? (
        <p className="text-muted-foreground">Cargando…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-2 pr-4">Nombre</th>
                <th className="py-2 pr-4">Contraseña</th>
                <th className="py-2 pr-4">Dispositivo</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border align-top">
                  <td className="py-2 pr-4">
                    {u.full_name}
                    {u.is_admin ? <span className="ml-2 text-xs text-primary">admin</span> : null}
                  </td>
                  <td className="py-2 pr-4 font-mono">{u.password}</td>
                  <td className="max-w-[12rem] break-all py-2 pr-4 font-mono text-xs text-muted-foreground">
                    {u.device_id ?? "—"}
                  </td>
                  <td className="py-2 pr-4">
                    <span className={u.active ? "text-primary" : "text-destructive"}>
                      {u.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="flex flex-wrap gap-2 py-2">
                    <Button size="sm" variant="outline" onClick={() => resetPass(u)}>
                      Cambiar contraseña
                    </Button>
                    {u.id !== meId ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          await toggle({ data: { token, userId: u.id, active: !u.active } });
                          refresh();
                        }}
                      >
                        {u.active ? "Desactivar" : "Activar"}
                      </Button>
                    ) : null}
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
