import type { PublicUser } from "@/lib/app.functions";

export function ProfilePanel({ user }: { user: PublicUser }) {
  const items = [
    ["Nombre", user.full_name],
    ["Tipo de cuenta", user.is_admin ? "Administrador" : "Alumno"],
    ["Cuenta creada", new Date(user.created_at).toLocaleDateString("es-ES")],
    ["Dispositivo recordado", user.is_admin ? "No (siempre pide contraseña)" : user.device_id ?? "—"],
  ];
  return (
    <section className="glass-panel animate-fade-up mx-auto max-w-xl rounded-3xl p-7">
      <h2 className="mb-6 text-2xl font-semibold">Perfil</h2>
      <dl className="space-y-4">
        {items.map(([k, v]) => (
          <div key={k} className="border-b border-border pb-3">
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
            <dd className="mt-1 break-all">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 text-xs text-muted-foreground">
        ¿Olvidaste tu contraseña? Pídele a Abdu que te la restablezca.
      </p>
    </section>
  );
}
