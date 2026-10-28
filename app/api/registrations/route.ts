import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendTicketEmail } from "@/lib/ticket-email";
import { mapRegistrationSuccess, mapTicketEmailData } from "@/lib/supabase/mappers";
import type {
  RegistrationRequest,
  RegistrationResultRow,
  TicketEmailRow,
} from "@/lib/types";

export const runtime = "nodejs";

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

  const result = (data?.[0] ?? null) as RegistrationResultRow | null;
  if (result?.outcome !== "success" || !result.registration_id || !result.ticket_code) {
    return NextResponse.json({ outcome: result?.outcome ?? "registration_error" });
  }

  const { data: ticketRows, error: ticketError } = await supabase.rpc("get_public_ticket", {
    p_code: result.ticket_code,
  });
  const ticket = (ticketRows?.[0] ?? null) as TicketEmailRow | null;
  if (ticketError || !ticket) {
    console.error("Ticket lookup for email failed", ticketError?.message ?? "Ticket not found");
    return NextResponse.json(mapRegistrationSuccess(result, false), { status: 201 });
  }

  try {
    await sendTicketEmail(mapTicketEmailData(ticket, result.registration_id));
  } catch (emailError) {
    console.error("Ticket email failed", emailError instanceof Error ? emailError.message : emailError);
    return NextResponse.json(mapRegistrationSuccess(result, false), { status: 201 });
  }

  return NextResponse.json(mapRegistrationSuccess(result, true), { status: 201 });
}
