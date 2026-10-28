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
  used: { label: "Utilizada", detail: "Esta entrada ya fue registrada en el acceso." },
  revoked: { label: "Revocada", detail: "Esta entrada fue anulada y ya no permite el acceso." },
};

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

  if (state === "loading") return <main className="digital-ticket-page"><p className="digital-ticket-message">Cargando entrada…</p></main>;
  if (state === "missing") return <main className="digital-ticket-page"><section className="digital-ticket digital-ticket-empty"><p className="digital-ticket-kicker">Door list</p><h1>Entrada no disponible</h1><p>Revisa que el enlace esté completo. Por seguridad no podemos buscar entradas por nombre o correo.</p><Link href="/">Ver eventos</Link></section></main>;
  if (state === "error" || !ticket) return <main className="digital-ticket-page"><section className="digital-ticket digital-ticket-empty"><p className="digital-ticket-kicker">Door list</p><h1>No pudimos abrir la entrada</h1><p>Actualiza la página para intentarlo de nuevo.</p></section></main>;

  const date = formatEventDateTime(ticket.event_starts_at);
  const status = statusCopy[ticket.ticket_status];

  return <main className="digital-ticket-page"><article className={`digital-ticket status-${ticket.ticket_status}`}>
    <header><p className="digital-ticket-kicker">Entrada digital</p><span className="digital-ticket-status">{status.label}</span><h1>{ticket.event_title}</h1><p>{status.detail}</p></header>
    <section className="digital-ticket-qr" aria-label="Código QR de la entrada"><QRCodeSVG value={ticket.ticket_code} size={260} level="M" marginSize={4} title={`Entrada para ${ticket.attendee_name}`} /></section>
    <dl><div><dt>Asistente</dt><dd>{ticket.attendee_name}</dd></div><div><dt>Correo</dt><dd>{ticket.attendee_email}</dd></div><div><dt>Tipo de entrada</dt><dd>{ticket.ticket_type_name}</dd></div><div><dt>Fecha</dt><dd>{date}</dd></div><div><dt>Lugar</dt><dd>{ticket.event_place}</dd></div></dl>
    <footer><span>Código</span><code>{ticket.ticket_code}</code><p>Presenta este QR en el acceso. No compartas públicamente este enlace.</p></footer>
  </article></main>;
}
