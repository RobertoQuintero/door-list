"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatEventDate, formatEventDateTime } from "@/lib/format";
import { supabase } from "@/lib/supabase/client";
import type { PublicEventRow } from "@/lib/types";

type EventsState = "loading" | "ready" | "error" | "retrying";

export default function PublicEventsClient() {
  const [events, setEvents] = useState<PublicEventRow[]>([]);
  const [state, setState] = useState<EventsState>("loading");

  const getEvents = useCallback(async () => {
    if (!supabase) return null;
    const { data, error } = await supabase.rpc("get_public_events");
    if (error) return null;
    return (data ?? []) as PublicEventRow[];
  }, []);

  useEffect(() => {
    async function loadInitialEvents() {
      const initialEvents = await getEvents();
      if (!initialEvents) { setState("error"); return; }
      setEvents(initialEvents);
      setState("ready");
    }
    void loadInitialEvents();
  }, [getEvents]);

  async function retryLoadEvents() {
    setState("retrying");
    const retriedEvents = await getEvents();
    if (!retriedEvents) { setState("error"); return; }
    setEvents(retriedEvents);
    setState("ready");
  }

  const eventGroups = useMemo(() => {
    const groups = new Map<string, PublicEventRow[]>();
    for (const event of events) {
      const label = formatEventDate(event.starts_at);
      groups.set(label, [...(groups.get(label) ?? []), event]);
    }
    return [...groups.entries()];
  }, [events]);

  return <main className="events-page">
    <header className="events-hero"><h1>Eventos con registro abierto</h1><p>Consulta la próxima fecha disponible y reserva tu lugar en unos pasos.</p></header>
    <section className="events-list" aria-labelledby="public-events-title" aria-busy={state === "loading" || state === "retrying"}>
      <div className="events-list-heading"><h2 id="public-events-title">Próximos eventos</h2></div>
      {state === "loading" && <div className="events-loading" aria-live="polite"><p>Cargando próximas fechas…</p>{[0, 1, 2].map((row) => <div className="event-row-skeleton" aria-hidden="true" key={row}><span /><span /><span /></div>)}</div>}
      {(state === "error" || state === "retrying") && <div className="events-state" role="alert"><strong>{state === "retrying" ? "Estamos cargando los eventos" : "No pudimos cargar los eventos"}</strong><p>{state === "retrying" ? "Esto puede tomar unos segundos." : "Revisa tu conexión e inténtalo de nuevo."}</p><button type="button" disabled={state === "retrying"} onClick={() => void retryLoadEvents()}>{state === "retrying" ? "Reintentando…" : "Reintentar"}</button></div>}
      {state === "ready" && !events.length && <div className="events-state"><strong>Aún no hay eventos publicados</strong><p>Las próximas fechas con registro abierto aparecerán aquí.</p></div>}
      {state === "ready" && eventGroups.map(([dateLabel, groupedEvents], groupIndex) => <section className="event-date-group" aria-labelledby={`event-date-${groupIndex}`} key={dateLabel}>
        <h3 id={`event-date-${groupIndex}`}>{groupIndex === 0 ? "Próximo evento" : dateLabel}</h3>
        {groupedEvents.map((event) => <EventCard event={event} key={event.event_id} />)}
      </section>)}
    </section>
  </main>;
}

function EventCard({ event }: { event: PublicEventRow }) {
  return <article className="event-card"><div><p className="event-card-date">{formatEventDateTime(event.starts_at)}</p><h2>{event.title}</h2>{event.description && <p>{event.description}</p>}<p className="event-card-place">{event.place}</p></div><div className="event-card-action"><span>{event.remaining_capacity} {event.remaining_capacity === 1 ? "lugar disponible" : "lugares disponibles"}</span><Link href={`/eventos/${event.event_id}/registro`}>Reservar lugar <b aria-hidden="true">→</b></Link></div></article>;
}
