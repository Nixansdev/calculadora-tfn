import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { Calculator as CalcIcon, History, LogOut, Sparkles, User, Users } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Calculator } from "@/components/Calculator";
import { AuthPanel } from "@/components/AuthPanel";
import { HistoryPanel } from "@/components/HistoryPanel";
import { ProfilePanel } from "@/components/ProfilePanel";
import { ManageUsers } from "@/components/ManageUsers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { addHistory, getMe, logout, type PublicUser } from "@/lib/app.functions";
import { clearToken, readToken } from "@/lib/session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Calculadora T.F.N. — Conversiones con desarrollo paso a paso" },
      {
        name: "description",
        content:
          "Convierte entre decimal, binario, octal y hexadecimal con el desarrollo completo, guarda tu historial y practica como en clase.",
      },
      { property: "og:title", content: "Calculadora T.F.N. — Conversiones con desarrollo" },
      {
        property: "og:description",
        content: "Divisiones sucesivas, T.F.N. y agrupación de bits con historial para cada alumno.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Tab = "calc" | "history" | "profile" | "users";

function Index() {
  const me = useServerFn(getMe);
  const doLogout = useServerFn(logout);
  const saveHistory = useServerFn(addHistory);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [tab, setTab] = useState<Tab>("calc");

  const load = useCallback(
    async (t: string | null) => {
      if (!t) {
        setLoading(false);
        return;
      }
      try {
        const u = await me({ data: { token: t } });
        if (u) {
          setToken(t);
          setUser(u);
        } else clearToken();
      } catch {
        clearToken();
      }
      setLoading(false);
    },
    [me],
  );

  useEffect(() => {
    load(readToken());
  }, [load]);

  async function signOut() {
    if (token) await doLogout({ data: { token } }).catch(() => {});
    clearToken();
    setToken(null);
    setUser(null);
    setTab("calc");
  }

  const tabs: { id: Tab; label: string; icon: typeof User }[] = user?.is_admin
    ? [
        { id: "calc", label: "Ecuaciones", icon: CalcIcon },
        { id: "history", label: "Historial", icon: History },
        { id: "users", label: "Manage Users", icon: Users },
        { id: "profile", label: "Perfil", icon: User },
      ]
    : [
        { id: "calc", label: "Ecuaciones", icon: CalcIcon },
        { id: "history", label: "Historial de ecuaciones", icon: History },
        { id: "profile", label: "Perfil", icon: User },
      ];

  return (
    <>
      <AnimatedBackground />
      <main className="relative mx-auto max-w-5xl px-5 pb-24 pt-12 sm:px-8">
        <header className="animate-fade-up space-y-5 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-primary">
            <Sparkles className="size-3.5" /> Representación de la información
          </span>
          <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
            Calculadora <span className="text-gradient">T.F.N.</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Creada por <strong className="text-primary">Abdu</strong>
          </p>
        </header>

        {loading ? (
          <p className="mt-16 text-center text-muted-foreground">Cargando…</p>
        ) : !user || !token ? (
          <AuthPanel onDone={(t) => load(t)} />
        ) : (
          <>
            <nav className="glass-panel mt-10 flex flex-wrap items-center gap-2 rounded-2xl p-2">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors",
                    tab === t.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary",
                  )}
                >
                  <t.icon className="size-4" />
                  {t.label}
                </button>
              ))}
              <span className="ml-auto hidden px-2 text-sm text-muted-foreground sm:inline">
                {user.full_name}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="size-4" /> Salir
              </Button>
            </nav>

            <div className="mt-10">
              {tab === "calc" ? (
                <Calculator
                  onSolve={(conversion, input, result) => {
                    saveHistory({ data: { token, conversion, input, result } }).catch(() => {});
                  }}
                />
              ) : null}
              {tab === "history" ? <HistoryPanel token={token} isAdmin={user.is_admin} /> : null}
              {tab === "profile" ? <ProfilePanel user={user} /> : null}
              {tab === "users" && user.is_admin ? <ManageUsers token={token} meId={user.id} /> : null}
            </div>
          </>
        )}

        <footer className="mt-16 space-y-1 text-center text-xs text-muted-foreground">
          <p>
            Proyecto desarrollado por <strong className="text-primary">Abdu</strong> · Todos los
            créditos para él
          </p>
          <p>Hecho para practicar sistemas de numeración · IES Leopoldo Queipo</p>
        </footer>
      </main>
    </>
  );
}
