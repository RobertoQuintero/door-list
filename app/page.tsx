"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatEventDateTime } from "@/lib/format";
import { supabase } from "@/lib/supabase/client";
import type { PublicEventRow } from "@/lib/types";

export default function PublicEventsPage() {
  const [events, setEvents] = useState<PublicEventRow[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    async function loadEvents() {
      if (!supabase) { setState("error"); return; }
      const { data, error } = await supabase.rpc("get_public_events");
      if (error) { setState("error"); return; }
      setEvents((data ?? []) as PublicEventRow[]);
      setState("ready");
    }
    void loadEvents();
  }, []);

  return <main className="events-page">
    <header className="events-hero"><p className="events-kicker">Door list</p><h1>Tu próxima salida empieza aquí.</h1><p>Elige un evento con lugares disponibles y registra tu entrada en unos pasos.</p></header>
    <section className="events-list" aria-labelledby="public-events-title" aria-live="polite" aria-busy={state === "loading"}>
      <div className="events-list-heading"><p className="events-kicker">Próximas fechas</p><h2 id="public-events-title">Eventos</h2></div>
      {state === "loading" && <div className="events-loading"><span className="sr-only">Cargando eventos…</span>{[0, 1, 2].map((row) => <div className="event-row-skeleton" aria-hidden="true" key={row}><span /><span /><span /></div>)}</div>}
      {state === "error" && <div className="events-state" role="alert"><strong>No pudimos cargar los eventos</strong><p>Revisa tu conexión y actualiza la página para intentarlo de nuevo.</p></div>}
      {state === "ready" && !events.length && <div className="events-state"><strong>Aún no hay eventos publicados</strong><p>Las próximas fechas con registro abierto aparecerán aquí.</p></div>}
      {state === "ready" && events.map((event) => {
        const date = formatEventDateTime(event.starts_at);
        return <article className="event-card" key={event.event_id}><div><p className="event-card-date">{date}</p><h2>{event.title}</h2>{event.description && <p>{event.description}</p>}<p className="event-card-place">{event.place}</p></div><div className="event-card-action"><span>{event.remaining_capacity} {event.remaining_capacity === 1 ? "lugar disponible" : "lugares disponibles"}</span><Link href={`/eventos/${event.event_id}/registro`}>Reservar lugar <b aria-hidden="true">→</b></Link></div></article>;
      })}
    </section>
  </main>;
}
