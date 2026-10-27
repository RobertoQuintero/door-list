"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type PublicEvent = {
  event_id: string;
  title: string;
  description: string | null;
  starts_at: string;
  place: string;
  remaining_capacity: number;
};

export default function PublicEventsPage() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    async function loadEvents() {
      if (!supabase) { setState("error"); return; }
      const { data, error } = await supabase.rpc("get_public_events");
      if (error) { setState("error"); return; }
      setEvents((data ?? []) as PublicEvent[]);
      setState("ready");
    }
    void loadEvents();
  }, []);

  return <main className="events-page">
    <header className="events-hero"><p className="events-kicker">Door list</p><h1>Tu próxima salida empieza aquí.</h1><p>Elige un evento con lugares disponibles y registra tu entrada en unos pasos.</p></header>
    <section className="events-list" aria-live="polite">
      {state === "loading" && <p className="events-message">Buscando eventos disponibles…</p>}
      {state === "error" && <p className="events-message">No pudimos cargar los eventos. Actualiza la página para intentarlo de nuevo.</p>}
      {state === "ready" && !events.length && <p className="events-message">No hay eventos con registro abierto por ahora. Vuelve pronto.</p>}
      {events.map((event) => {
        const date = new Intl.DateTimeFormat("es-MX", { dateStyle: "full", timeStyle: "short", timeZone: "America/Mexico_City" }).format(new Date(event.starts_at));
        return <article className="event-card" key={event.event_id}><div><p className="event-card-date">{date}</p><h2>{event.title}</h2>{event.description && <p>{event.description}</p>}<p className="event-card-place">{event.place}</p></div><div className="event-card-action"><span>{event.remaining_capacity} {event.remaining_capacity === 1 ? "lugar disponible" : "lugares disponibles"}</span><Link href={`/eventos/${event.event_id}/registro`}>Reservar lugar <b aria-hidden="true">→</b></Link></div></article>;
      })}
    </section>
  </main>;
}
