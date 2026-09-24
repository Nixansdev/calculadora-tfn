import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { checkName, login, register } from "@/lib/app.functions";
import { getDeviceId, saveToken } from "@/lib/session";

type Step = "name" | "create" | "login";

const inputCls =
  "h-11 w-full rounded-lg border border-input bg-secondary/60 px-3 outline-none focus:ring-2 focus:ring-ring";

export function AuthPanel({ onDone }: { onDone: (token: string) => void }) {
  const check = useServerFn(checkName);
  const doRegister = useServerFn(register);
  const doLogin = useServerFn(login);
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
    } catch {
      setMsg("Revisa los datos e inténtalo de nuevo.");
    }
    setBusy(false);
  }

  function nextFromName() {
    const n = name.trim();
    if (n.split(/\s+/).length < 2) {
      setMsg("Escribe tu nombre real y completo (nombre y apellido), no un apodo.");
      return;
    }
    run(async () => {
      const { exists } = await check({ data: { name: n } });
      if (exists) {
        setMsg(
          "Ya existe una cuenta con ese nombre. Comprueba que está bien escrito o añade tu primer apellido para diferenciarlo.",
        );
      } else setStep("create");
    });
  }

  function create() {
    if (password.length < 4) return setMsg("La contraseña debe tener al menos 4 caracteres.");
    if (password !== password2) return setMsg("Las contraseñas no coinciden.");
    run(async () => {
      const r = await doRegister({ data: { name: name.trim(), password, deviceId: getDeviceId() } });
      if (!r.ok) return setMsg(r.error);
      saveToken(r.token, false);
      onDone(r.token);
    });
  }

  function signIn() {
    run(async () => {
      const r = await doLogin({ data: { name: name.trim(), password, deviceId: getDeviceId() } });
      if (!r.ok) return setMsg(r.error);
      saveToken(r.token, r.isAdmin);
      onDone(r.token);
    });
  }

  return (
    <section className="glass-panel animate-fade-up mx-auto mt-12 max-w-md space-y-5 rounded-3xl p-7">
      <h2 className="text-2xl font-semibold">
        {step === "name" ? "Bienvenido" : step === "create" ? "Crea tu contraseña" : "Iniciar sesión"}
      </h2>

      {step === "name" ? (
        <>
          <p className="text-sm text-muted-foreground">
            ¿Es tu primera vez? Escribe tu nombre real y completo.
          </p>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && nextFromName()}
            placeholder="Nombre y apellido"
          />
          <Button className="w-full" onClick={nextFromName} disabled={busy}>
            Continuar
          </Button>
          <button
            className="w-full text-sm text-primary hover:underline"
            onClick={() => {
              setMsg(null);
              setStep("login");
            }}
          >
            Ya tengo cuenta · entrar con contraseña
          </button>
        </>
      ) : null}

      {step === "create" ? (
        <>
          <p className="text-sm text-muted-foreground">
            Cuenta para <strong className="text-foreground">{name.trim()}</strong>. Guarda bien tu
            contraseña: la necesitarás en otros dispositivos.
          </p>
          <input className={inputCls} type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input className={inputCls} type="password" placeholder="Repite la contraseña" value={password2} onChange={(e) => setPassword2(e.target.value)} onKeyDown={(e) => e.key === "Enter" && create()} />
          <Button className="w-full" onClick={create} disabled={busy}>
            Crear cuenta
          </Button>
          <button className="w-full text-sm text-muted-foreground hover:underline" onClick={() => setStep("name")}>
            Volver
          </button>
        </>
      ) : null}

      {step === "login" ? (
        <>
          <input className={inputCls} placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={inputCls} type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && signIn()} />
          <Button className="w-full" onClick={signIn} disabled={busy}>
            Entrar
          </Button>
          <button className="w-full text-sm text-primary hover:underline" onClick={() => { setMsg(null); setStep("name"); }}>
            Soy nuevo · crear cuenta
          </button>
        </>
      ) : null}

      {msg ? <p className="text-sm text-destructive">{msg}</p> : null}
    </section>
  );
}
