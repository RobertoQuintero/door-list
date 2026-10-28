"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useOrganizerSession } from "@/components/dashboard-session-provider";
import { formatEventDateTime, formatRegistrationDateTime } from "@/lib/format";
import { supabase } from "@/lib/supabase/client";
import { mapEventDashboard, type OrganizerEventDashboardRow } from "@/lib/supabase/mappers";
import type { EventDashboard } from "@/lib/types";

const ticketStatusLabels = { valid: "Vigente", used: "Usada", revoked: "Revocada" } as const;

export function EventDashboardView({ eventId }: { eventId: string }) {
  const user = useOrganizerSession();
  const [dashboard, setDashboard] = useState<EventDashboard | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");

  useEffect(() => {
    async function loadDashboard() {
      if (!supabase) return;
      setState("loading");
      try {
        const { data, error } = await supabase.rpc("get_organizer_event_dashboard", { p_event_id: eventId });
        if (error) {
          setState("error");
          return;
        }
        const result = mapEventDashboard((data ?? []) as OrganizerEventDashboardRow[]);
        setDashboard(result);
        setState(result ? "ready" : "missing");
      } catch {
        setState("error");
      }
    }
    void loadDashboard();
  }, [eventId, user.id]);

  if (state === "loading") return <main className="dashboard-main"><p className="dashboard-message">Preparando el manifiesto…</p></main>;
  if (state === "error") return <main className="dashboard-main"><Link className="dashboard-back" href="/dashboard">← Volver al panel</Link><p className="dashboard-message error" role="alert">No pudimos cargar este evento. Actualiza la página para intentarlo de nuevo.</p></main>;
  if (state === "missing" || !dashboard) return <main className="dashboard-main"><Link className="dashboard-back" href="/dashboard">← Volver al panel</Link><div className="dashboard-empty"><strong>Evento no disponible.</strong><p>No existe o no tienes permiso para consultar sus registros.</p></div></main>;

  const { event, ticketTypes, registrations } = dashboard;

  return <main className="dashboard-main event-dashboard-detail">
    <Link className="dashboard-back" href="/dashboard">← Todos los eventos</Link>
    <header className="event-dashboard-header">
      <div><p className="dashboard-kicker">Manifiesto de acceso</p><h1>{event.title}</h1><p>{formatEventDateTime(event.startsAt)} · {event.place}</p></div>
      <div className="event-total"><span>Registros</span><strong>{event.registeredCount}</strong><small>de {event.maxCapacity} lugares</small></div>
    </header>

    <section className="ticket-capacity-section" aria-labelledby="ticket-capacity-title">
      <div className="manifest-heading"><div><p className="dashboard-kicker">Distribución</p><h2 id="ticket-capacity-title">Tipos de entrada</h2></div><span>{ticketTypes.length} {ticketTypes.length === 1 ? "tipo" : "tipos"}</span></div>
      {ticketTypes.length ? <div className="ticket-capacity-grid">{ticketTypes.map((ticketType) => {
        const percentage = Math.min(100, ticketType.registeredCount / ticketType.maxCapacity * 100);
        return <article className="ticket-capacity-card" key={ticketType.id}>
          <div><h3>{ticketType.name}</h3><p><strong>{ticketType.registeredCount}</strong> / {ticketType.maxCapacity}</p></div>
          <div className="admission-strip" aria-label={`${ticketType.registeredCount} de ${ticketType.maxCapacity} lugares registrados`}><span style={{ width: `${percentage}%` }} /></div>
          <small>{ticketType.maxCapacity - ticketType.registeredCount} lugares disponibles</small>
        </article>;
      })}</div> : <p className="dashboard-message">Este evento todavía no tiene tipos de entrada.</p>}
    </section>

    <section className="attendee-section" aria-labelledby="attendee-title">
      <div className="manifest-heading"><div><p className="dashboard-kicker">Lista nominal</p><h2 id="attendee-title">Asistentes registrados</h2></div><span>{registrations.length} {registrations.length === 1 ? "persona" : "personas"}</span></div>
      {registrations.length ? <div className="attendee-table-wrap"><table className="attendee-table">
        <thead><tr><th>Asistente</th><th>Tipo de entrada</th><th>Registro</th><th>Estado</th></tr></thead>
        <tbody>{registrations.map((registration) => <tr key={registration.id}>
          <td data-label="Asistente"><strong>{registration.attendeeName}</strong><a href={`mailto:${registration.attendeeEmail}`}>{registration.attendeeEmail}</a></td>
          <td data-label="Tipo de entrada">{registration.ticketTypeName}</td>
          <td data-label="Registro">{formatRegistrationDateTime(registration.createdAt)}</td>
          <td data-label="Estado"><span className={`ticket-state ${registration.ticketStatus ?? "pending"}`}>{registration.ticketStatus ? ticketStatusLabels[registration.ticketStatus] : "Pendiente"}</span></td>
        </tr>)}</tbody>
      </table></div> : <div className="dashboard-empty compact"><strong>Aún no hay asistentes.</strong><p>Los nuevos registros aparecerán aquí.</p></div>}
    </section>
  </main>;
}
