export type Event = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  place: string;
  max_capacity: number;
};

export type TicketType = {
  id: string;
  event_id: string;
  name: string;
  max_capacity: number;
};

export type PublicEventRow = {
  event_id: string;
  title: string;
  description: string | null;
  starts_at: string;
  place: string;
  remaining_capacity: number;
};

export type RegistrationAvailabilityRow = {
  event_id: string;
  title: string;
  description: string | null;
  starts_at: string;
  place: string;
  ticket_type_id: string | null;
  ticket_name: string | null;
  ticket_capacity: number | null;
  registered_count: number;
  remaining_capacity: number;
};

export type TicketStatus = "valid" | "used" | "revoked";

export type PublicTicketRow = {
  ticket_code: string;
  ticket_status: TicketStatus;
  attendee_name: string;
  attendee_email: string;
  event_title: string;
  event_starts_at: string;
  event_place: string;
  ticket_type_name: string;
};

export type RegistrationRequest = {
  eventId?: unknown;
  ticketTypeId?: unknown;
  attendeeName?: unknown;
  attendeeEmail?: unknown;
};

export type RegistrationOutcome =
  | "success"
  | "invalid_request"
  | "invalid_name"
  | "invalid_email"
  | "event_not_available"
  | "ticket_not_found"
  | "ticket_sold_out"
  | "duplicate_registration"
  | "registration_error"
  | "server_not_configured";

export type RegistrationErrorCode = Exclude<RegistrationOutcome, "success">;

export type RegistrationSuccessResponse = {
  outcome: "success";
  ticketCode: string;
  emailSent: boolean;
};

export type RegistrationErrorResponse = {
  error: RegistrationErrorCode;
};

export type RegistrationResponse = RegistrationSuccessResponse | RegistrationErrorResponse;

export type RegistrationResultRow = {
  outcome: RegistrationOutcome;
  registration_id: string | null;
  ticket_code: string | null;
};

export type TicketEmailRow = {
  ticket_code: string;
  attendee_name: string;
  attendee_email: string;
  event_title: string;
  event_starts_at: string;
  event_place: string;
  ticket_type_name: string;
};

export type TicketEmailData = {
  registrationId: string;
  ticketCode: string;
  attendeeName: string;
  attendeeEmail: string;
  eventTitle: string;
  eventStartsAt: string;
  eventPlace: string;
  ticketTypeName: string;
};
