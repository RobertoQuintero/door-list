"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatEventDateTime } from "@/lib/format";
import { supabase } from "@/lib/supabase/client";
import type {
  RegistrationAvailabilityRow,
  RegistrationErrorCode,
  RegistrationErrorResponse,
  RegistrationSuccessResponse,
} from "@/lib/types";

type ViewState = "loading" | "available" | "unavailable" | "error";
type SubmissionState = "idle" | "submitting" | "success";

const messages: Record<RegistrationErrorCode, string> = {
  event_not_available: "Este evento ya no está disponible para registro.",
  ticket_not_found: "La entrada seleccionada ya no está disponible. Elige otra opción.",
  ticket_sold_out: "Esta entrada acaba de agotarse. Elige otra opción.",
  duplicate_registration: "Ya existe un registro con este correo para el evento.",
  invalid_name: "Escribe tu nombre para continuar.",
  invalid_email: "Escribe un correo electrónico válido.",
  invalid_request: "Revisa tus datos e inténtalo nuevamente.",
  registration_error: "No pudimos completar tu registro. Inténtalo nuevamente.",
  server_not_configured: "El registro no está configurado en este momento.",
};

export default function PublicRegistrationPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;
  const [rows, setRows] = useState<RegistrationAvailabilityRow[]>([]);
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ticketCode, setTicketCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [message, setMessage] = useState("");

  const loadEvent = useCallback(async () => {
    if (!supabase) {
      setViewState("error");
      setMessage("El registro no está configurado en este momento.");
      return;
    }

    setViewState("loading");
    const { data, error } = await supabase.rpc("get_public_event_registration", { p_event_id: eventId });
    if (error) {
      setViewState("error");
      setMessage("No pudimos consultar la disponibilidad. Inténtalo de nuevo.");
      return;
    }

    const nextRows = (data ?? []) as RegistrationAvailabilityRow[];
    if (!nextRows.length) {
      setViewState("unavailable");
      return;
    }

    setRows(nextRows);
    setViewState("available");
    const firstAvailable = nextRows.find((ticket) => ticket.ticket_type_id && ticket.remaining_capacity > 0);
    setSelectedTicketId((current) => current || firstAvailable?.ticket_type_id || "");
  }, [eventId]);

  useEffect(() => {
    const request = window.setTimeout(() => { void loadEvent(); }, 0);
    return () => window.clearTimeout(request);
  }, [loadEvent]);

  const event = rows[0];
  const tickets = useMemo(() => rows.filter((ticket) => ticket.ticket_type_id && ticket.ticket_name), [rows]);
  const hasAvailability = tickets.some((ticket) => ticket.remaining_capacity > 0);

  async function submit(eventSubmit: FormEvent<HTMLFormElement>) {
    eventSubmit.preventDefault();
    if (!selectedTicketId) return;
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanName) { setMessage("Escribe tu nombre para continuar."); return; }
    if (!cleanEmail) { setMessage("Escribe tu correo electrónico para continuar."); return; }

    setSubmissionState("submitting");
    setMessage("");
    let response: Response;
    try {
      response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          ticketTypeId: selectedTicketId,
          attendeeName: cleanName,
          attendeeEmail: cleanEmail,
        }),
      });
    } catch {
      setSubmissionState("idle");
      setMessage("No pudimos completar tu registro. Revisa tu conexión e inténtalo nuevamente.");
      return;
    }

    if (!response.ok) {
      setSubmissionState("idle");
      let errorCode: RegistrationErrorCode = "registration_error";
      try {
        const result = await response.json() as Partial<RegistrationErrorResponse>;
        if (result.error && result.error in messages) errorCode = result.error;
      } catch {
        setMessage(messages.registration_error);
        return;
      }
      setMessage(messages[errorCode]);
      if (errorCode === "ticket_sold_out" || errorCode === "ticket_not_found") {
        setSelectedTicketId("");
        await loadEvent();
      }
      if (errorCode === "event_not_available") setViewState("unavailable");
      return;
    }

    let result: RegistrationSuccessResponse;
    try {
      result = await response.json() as RegistrationSuccessResponse;
    } catch {
      setSubmissionState("idle");
      setMessage(messages.registration_error);
      return;
    }

    if (result.outcome === "success" && result.ticketCode) {
      setTicketCode(result.ticketCode);
      setEmailSent(result.emailSent === true);
      setSubmissionState("success");
      return;
    }

    setSubmissionState("idle");
    setMessage("No pudimos completar tu registro.");
  }

  if (viewState === "loading") return <main className="registration-page"><p className="registration-status">Consultando disponibilidad…</p></main>;
  if (viewState === "unavailable") return <main className="registration-page"><section className="registration-card registration-empty"><p className="registration-kicker">Door list</p><h1>Registro cerrado</h1><p>Este evento no está disponible para registro.</p></section></main>;
  if (viewState === "error" || !event) return <main className="registration-page"><section className="registration-card registration-empty"><p className="registration-kicker">Door list</p><h1>No pudimos abrir el registro</h1><p>{message}</p><button type="button" onClick={() => void loadEvent()}>Intentar de nuevo</button></section></main>;

  const date = formatEventDateTime(event.starts_at);
  if (submissionState === "success") {
    const selectedTicket = tickets.find((ticket) => ticket.ticket_type_id === selectedTicketId);
    return <main className="registration-page"><section className="registration-card registration-success"><p className="registration-kicker">Registro confirmado</p><h1>Tu entrada está lista.</h1><p>Tu lugar para <strong>{event.title}</strong> quedó registrado.</p><dl><div><dt>Entrada</dt><dd>{selectedTicket?.ticket_name}</dd></div><div><dt>Nombre</dt><dd>{name.trim()}</dd></div><div><dt>Correo</dt><dd>{email.trim().toLowerCase()}</dd></div></dl><p className={emailSent ? "registration-email-status" : "registration-alert"} role="status">{emailSent ? "Te enviamos la entrada y su QR por correo." : "Tu registro se confirmó, pero no pudimos enviar el correo. Abre y guarda tu entrada desde este dispositivo."}</p><Link className="registration-ticket-link" href={`/entradas/${ticketCode}`}>Abrir mi entrada y QR →</Link><p className="registration-save-note">Guarda el enlace de tu entrada para presentarlo en el acceso.</p></section></main>;
  }

  return <main className="registration-page"><section className="registration-card">
    <header className="registration-header"><Link className="registration-back" href="/">← Ver eventos</Link><p className="registration-kicker">Registro de asistentes</p><h1>{event.title}</h1>{event.description && <p className="registration-description">{event.description}</p>}<p className="registration-detail"><time dateTime={event.starts_at}>{date}</time><span>{event.place}</span></p></header>
    {!hasAvailability ? <p className="registration-alert" role="status">El evento está agotado.</p> : <form className="registration-form" onSubmit={submit} noValidate><fieldset disabled={submissionState === "submitting"}><legend>Elige tu entrada</legend><div className="ticket-options">{tickets.map((ticket) => {
      const soldOut = ticket.remaining_capacity < 1;
      return <label className={`ticket-option${selectedTicketId === ticket.ticket_type_id ? " selected" : ""}${soldOut ? " sold-out" : ""}`} key={ticket.ticket_type_id}><input type="radio" name="ticket" value={ticket.ticket_type_id ?? ""} checked={selectedTicketId === ticket.ticket_type_id} disabled={soldOut} onChange={(input) => setSelectedTicketId(input.target.value)} /><span><strong>{ticket.ticket_name}</strong><small>{soldOut ? "Agotada" : `${ticket.remaining_capacity} ${ticket.remaining_capacity === 1 ? "lugar disponible" : "lugares disponibles"}`}</small></span></label>;
    })}</div><label>Nombre<input value={name} onChange={(input) => setName(input.target.value)} autoComplete="name" maxLength={120} required /></label><label>Correo electrónico<input value={email} onChange={(input) => setEmail(input.target.value)} type="email" autoComplete="email" maxLength={320} required /></label>{message && <p className="registration-alert" role="alert">{message}</p>}<button type="submit" disabled={!selectedTicketId || submissionState === "submitting"}>{submissionState === "submitting" ? "Confirmando…" : "Confirmar registro"}</button></fieldset></form>}
  </section></main>;
}
