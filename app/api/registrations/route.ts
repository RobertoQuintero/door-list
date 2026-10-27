import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendTicketEmail } from "../../lib/ticket-email";

export const runtime = "nodejs";

type RegistrationRequest = {
  eventId?: unknown;
  ticketTypeId?: unknown;
  attendeeName?: unknown;
  attendeeEmail?: unknown;
};

type RegistrationResult = {
  outcome: string;
  registration_id: string | null;
  ticket_code: string | null;
};

type TicketData = {
  ticket_code: string;
  attendee_name: string;
  attendee_email: string;
  event_title: string;
  event_starts_at: string;
  event_place: string;
  ticket_type_name: string;
};

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let body: RegistrationRequest;
  try {
    body = await request.json() as RegistrationRequest;
  } catch {
    return NextResponse.json({ outcome: "invalid_request" }, { status: 400 });
  }

  const eventId = typeof body.eventId === "string" ? body.eventId : "";
  const ticketTypeId = typeof body.ticketTypeId === "string" ? body.ticketTypeId : "";
  const attendeeName = typeof body.attendeeName === "string" ? body.attendeeName.trim() : "";
  const attendeeEmail = typeof body.attendeeEmail === "string" ? body.attendeeEmail.trim().toLowerCase() : "";
  if (!uuid.test(eventId) || !uuid.test(ticketTypeId) || !attendeeName || !attendeeEmail) {
    return NextResponse.json({ outcome: "invalid_request" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ outcome: "server_not_configured" }, { status: 503 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase.rpc("create_public_registration", {
    p_event_id: eventId,
    p_ticket_type_id: ticketTypeId,
    p_attendee_name: attendeeName,
    p_attendee_email: attendeeEmail,
  });
  if (error) {
    console.error("Registration RPC failed", error.message);
    return NextResponse.json({ outcome: "registration_error" }, { status: 500 });
  }

  const result = (data?.[0] ?? null) as RegistrationResult | null;
  if (result?.outcome !== "success" || !result.registration_id || !result.ticket_code) {
    return NextResponse.json({ outcome: result?.outcome ?? "registration_error" });
  }

  const { data: ticketRows, error: ticketError } = await supabase.rpc("get_public_ticket", {
    p_code: result.ticket_code,
  });
  const ticket = (ticketRows?.[0] ?? null) as TicketData | null;
  if (ticketError || !ticket) {
    console.error("Ticket lookup for email failed", ticketError?.message ?? "Ticket not found");
    return NextResponse.json({
      outcome: "success",
      ticketCode: result.ticket_code,
      emailSent: false,
    }, { status: 201 });
  }

  try {
    await sendTicketEmail({
      registrationId: result.registration_id,
      ticketCode: ticket.ticket_code,
      attendeeName: ticket.attendee_name,
      attendeeEmail: ticket.attendee_email,
      eventTitle: ticket.event_title,
      eventStartsAt: ticket.event_starts_at,
      eventPlace: ticket.event_place,
      ticketTypeName: ticket.ticket_type_name,
    });
  } catch (emailError) {
    console.error("Ticket email failed", emailError instanceof Error ? emailError.message : emailError);
    return NextResponse.json({
      outcome: "success",
      ticketCode: result.ticket_code,
      emailSent: false,
    }, { status: 201 });
  }

  return NextResponse.json({
    outcome: "success",
    ticketCode: result.ticket_code,
    emailSent: true,
  }, { status: 201 });
}
