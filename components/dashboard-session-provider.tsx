"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, type FormEvent, type ReactNode, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const SessionContext = createContext<User | null>(null);

const authMessages = {
  session: "No pudimos comprobar tu sesión. Inicia sesión nuevamente.",
  login: "No pudimos iniciar sesión. Revisa tu correo y contraseña.",
};

export function useOrganizerSession() {
  const user = useContext(SessionContext);
  if (!user) throw new Error("useOrganizerSession must be used inside DashboardSessionProvider");
  return user;
}

export function DashboardSessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<"loading" | "ready">(supabase ? "loading" : "ready");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    void supabase.auth.getUser().then(({ data, error }) => {
      if (error) setNotice(authMessages.session);
      setUser(data.user);
      setState("ready");
    }).catch(() => {
      setNotice(authMessages.session);
      setState("ready");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setState("ready");
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function login(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setNotice("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setNotice(authMessages.login);
    } catch {
      setNotice(authMessages.login);
    } finally {
      setBusy(false);
    }
  }

  if (!supabase) {
    return <main className="dashboard-state"><div><p className="dashboard-kicker">Door list</p><h1>Configura Supabase</h1><p>Agrega las variables de entorno para abrir el panel.</p></div></main>;
  }

  if (state === "loading") {
    return <main className="dashboard-state"><p className="dashboard-kicker">Preparando tu lista de acceso…</p></main>;
  }

  if (!user) {
    return <main className="dashboard-login"><section className="dashboard-login-card">
      <p className="dashboard-kicker">Acceso de organizadores</p>
      <h1>La puerta empieza aquí.</h1>
      <p>Consulta el aforo y a cada persona registrada en tus eventos.</p>
      <form onSubmit={login}>
        <label>Correo<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
        <label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
        <button disabled={busy}>{busy ? "Entrando…" : "Entrar al panel"}</button>
      </form>
      {notice && <p className="dashboard-notice" role="alert">{notice}</p>}
      <Link href="/organizador">¿Aún no tienes cuenta? Crear acceso</Link>
      <Link href="/">Volver a los eventos</Link>
    </section></main>;
  }

  return <SessionContext.Provider value={user}>
    <div className="organizer-dashboard">
      <header className="dashboard-topbar">
        <Link className="dashboard-brand" href="/dashboard"><span>DL</span><strong>Control de puerta</strong></Link>
        <nav aria-label="Panel del organizador">
          <Link className={pathname === "/dashboard" ? "active" : ""} href="/dashboard">Resumen</Link>
          <Link href="/organizador">Gestionar eventos</Link>
        </nav>
        <div className="dashboard-account"><span>{user.email}</span><button type="button" onClick={() => void supabase?.auth.signOut()}>Cerrar sesión</button></div>
      </header>
      {children}
    </div>
  </SessionContext.Provider>;
}
