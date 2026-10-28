"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useOrganizerSession } from "@/components/dashboard-session-provider";
import { formatEventDateTime } from "@/lib/format";
import { supabase } from "@/lib/supabase/client";
import { mapOrganizerEvent, type OrganizerEventRow } from "@/lib/supabase/mappers";
import type { OrganizerEvent } from "@/lib/types";

export function OrganizerEvents() {
  const user = useOrganizerSession();
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const totals = useMemo(() => events.reduce((summary, event) => ({
    registered: summary.registered + event.registeredCount,
    capacity: summary.capacity + event.maxCapacity,
  }), { registered: 0, capacity: 0 }), [events]);

  useEffect(() => {
    async function loadEvents() {
      if (!supabase) return;
      setState("loading");
      try {
        const { data, error } = await supabase.rpc("get_organizer_events");
        if (error) {
          setState("error");
          return;
        }
        setEvents(((data ?? []) as OrganizerEventRow[]).map(mapOrganizerEvent));
        setState("ready");
      } catch {
        setState("error");
      }
    }
    void loadEvents();
  }, [user.id]);

  return <main className="dashboard-main">
    <header className="dashboard-intro">
      <div><p className="dashboard-kicker">Panel del organizador</p><h1>Tus puertas,<br />bajo control.</h1></div>
      <dl className="dashboard-totals">
        <div><dt>Eventos activos</dt><dd>{events.length.toString().padStart(2, "0")}</dd></div>
        <div><dt>Registros totales</dt><dd>{totals.registered}<span> / {totals.capacity}</span></dd></div>
      </dl>
    </header>

    <section className="event-manifest" aria-labelledby="event-manifest-title" aria-live="polite">
      <div className="manifest-heading"><div><p className="dashboard-kicker">Agenda activa</p><h2 id="event-manifest-title">Eventos</h2></div><Link href="/organizador">+ Crear evento</Link></div>
      {state === "loading" && <p className="dashboard-message">Cargando tus eventos…</p>}
      {state === "error" && <p className="dashboard-message error" role="alert">No pudimos cargar tus eventos. Actualiza la página para intentarlo de nuevo.</p>}
      {state === "ready" && !events.length && <div className="dashboard-empty"><strong>Tu agenda está vacía.</strong><p>Crea un evento y vuelve aquí para seguir sus registros.</p><Link href="/organizador">Crear el primer evento</Link></div>}
      {state === "ready" && events.length > 0 && <div className="organizer-event-list">
        {events.map((event, index) => {
          const percentage = Math.min(100, event.registeredCount / event.maxCapacity * 100);
          return <Link className="organizer-event-row" href={`/dashboard/eventos/${event.id}`} key={event.id}>
            <span className="event-sequence">{String(index + 1).padStart(2, "0")}</span>
            <span className="event-identity"><small>{formatEventDateTime(event.startsAt)}</small><strong>{event.title}</strong><em>{event.place}</em></span>
            <span className="event-occupancy"><span><b>{event.registeredCount}</b> / {event.maxCapacity}</span><i><i style={{ width: `${percentage}%` }} /></i><small>{Math.round(percentage)}% del aforo</small></span>
            <span className="event-arrow" aria-hidden="true">↗</span>
          </Link>;
        })}
      </div>}
    </section>
  </main>;
}
