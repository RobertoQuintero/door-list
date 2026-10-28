import type {
  RegistrationResultRow,
  RegistrationSuccessResponse,
  TicketEmailData,
  TicketEmailRow,
} from "../types";

export function mapTicketEmailData(row: TicketEmailRow, registrationId: string): TicketEmailData {
  return {
    registrationId,
    ticketCode: row.ticket_code,
    attendeeName: row.attendee_name,
    attendeeEmail: row.attendee_email,
    eventTitle: row.event_title,
    eventStartsAt: row.event_starts_at,
    eventPlace: row.event_place,
    ticketTypeName: row.ticket_type_name,
  };
}

export function mapRegistrationSuccess(
  row: RegistrationResultRow,
  emailSent: boolean,
): RegistrationSuccessResponse {
  if (!row.ticket_code) throw new Error("A successful registration must include a ticket code");

  return {
    outcome: "success",
    ticketCode: row.ticket_code,
    emailSent,
  };
}
