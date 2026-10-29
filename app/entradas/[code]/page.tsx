"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { formatEventDateTime } from "@/lib/format";
import { supabase } from "@/lib/supabase/client";
import type { PublicTicketRow, TicketStatus } from "@/lib/types";

const statusCopy: Record<TicketStatus, { label: string; detail: string }> = {
  valid: { label: "Válida", detail: "Lista para presentarse en el acceso." },
  used: { label: "Utilizada", detail: "Esta entrada ya fue registrada en el acceso. Pide ayuda al equipo de puerta si necesitas revisarla." },
  revoked: { label: "Revocada", detail: "Esta entrada fue anulada y ya no permite el acceso. Pide ayuda al equipo de puerta si crees que es un error." },
};

function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");
  if (!domain) return "Correo protegido";

  const visiblePart = localPart.slice(0, 2);
  return `${visiblePart}${"•".repeat(Math.max(3, localPart.length - visiblePart.length))}@${domain}`;
}

export default function PublicTicketPage() {
  const params = useParams<{ code: string }>();
  const code = params.code.toLowerCase();
  const [ticket, setTicket] = useState<PublicTicketRow | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");

  useEffect(() => {
    async function loadTicket() {
      if (!supabase || !/^[0-9a-f]{64}$/.test(code)) { setState("missing"); return; }
      const { data, error } = await supabase.rpc("get_public_ticket", { p_code: code });
      if (error) { setState("error"); return; }
      const result = (data?.[0] ?? null) as PublicTicketRow | null;
      if (!result) { setState("missing"); return; }
      setTicket(result);
      setState("ready");
    }
    void loadTicket();
  }, [code]);

  if (state === "loading") return <main className="digital-ticket-page"><p className="digital-ticket-message" role="status" aria-live="polite">Cargando tu entrada…</p></main>;
  if (state === "missing") return <main className="digital-ticket-page"><section className="digital-ticket digital-ticket-empty"><h1>Entrada no disponible</h1><p>Revisa que el enlace esté completo. Por seguridad no podemos buscar entradas por nombre o correo.</p><Link href="/">Ver eventos</Link></section></main>;
  if (state === "error" || !ticket) return <main className="digital-ticket-page"><section className="digital-ticket digital-ticket-empty" role="alert"><h1>No pudimos abrir la entrada</h1><p>Revisa tu conexión e inténtalo de nuevo. Si estás en el acceso, pide ayuda al equipo de puerta.</p><div className="digital-ticket-actions"><button className="digital-ticket-action" type="button" onClick={() => window.location.reload()}>Reintentar</button><Link className="digital-ticket-link" href="/">Ver eventos</Link></div></section></main>;

  const date = formatEventDateTime(ticket.event_starts_at);
  const status = statusCopy[ticket.ticket_status];
  const canEnter = ticket.ticket_status === "valid";
  const referenceCode = ticket.ticket_code.slice(0, 8).toUpperCase();

  return <main className="digital-ticket-page"><article className={`digital-ticket status-${ticket.ticket_status}`}>
    <header><span className="digital-ticket-status">{status.label}</span></header>
    {canEnter ? <section className="digital-ticket-access" aria-label="Código QR de la entrada"><QRCodeSVG value={ticket.ticket_code} size={260} level="M" marginSize={4} title={`Entrada para ${ticket.attendee_name}`} /><p>Presenta este QR en el acceso.</p></section> : <section className="digital-ticket-access digital-ticket-access-denied" aria-labelledby="ticket-access-status"><strong id="ticket-access-status">No presentar esta entrada</strong><p>{status.detail}</p></section>}
    <section className="digital-ticket-event"><h1>{ticket.event_title}</h1><p>{canEnter ? status.detail : "Consulta al equipo de puerta antes de continuar."}</p></section>
    <dl className="digital-ticket-access-details"><div><dt>Tipo de entrada</dt><dd>{ticket.ticket_type_name}</dd></div><div><dt>Fecha</dt><dd>{date}</dd></div><div><dt>Lugar</dt><dd>{ticket.event_place}</dd></div></dl>
    <details className="digital-ticket-holder"><summary>Datos del titular</summary><dl><div><dt>Asistente</dt><dd>{ticket.attendee_name}</dd></div><div><dt>Correo</dt><dd>{maskEmail(ticket.attendee_email)}</dd></div></dl></details>
    <footer><span>Referencia de entrada</span><code>{referenceCode}</code><p>Guarda este enlace en privado. Si el QR no se puede leer, muestra esta referencia al equipo de puerta.</p></footer>
  </article></main>;
}
