import type {
  EventDashboard,
  OrganizerEvent,
  RegistrationTrendPoint,
  RegistrationResultRow,
  RegistrationSuccessResponse,
  TicketEmailData,
  TicketEmailRow,
} from "../types";

export type RegistrationTrendRow = {
  registration_date: string;
  registration_count: number;
};

export type OrganizerEventRow = {
  event_id: string;
  title: string;
  starts_at: string;
  place: string;
  max_capacity: number;
  registered_count: number;
};

export type OrganizerEventDashboardRow = {
  event_id: string;
  event_title: string;
  event_starts_at: string;
  event_place: string;
  event_max_capacity: number;
  ticket_type_id: string | null;
  ticket_type_name: string | null;
  ticket_type_capacity: number | null;
  registered_count: number;
  registration_id: string | null;
  attendee_name: string | null;
  attendee_email: string | null;
  registered_at: string | null;
  ticket_code: string | null;
  ticket_status: "valid" | "used" | "revoked" | null;
};

export function mapOrganizerEvent(row: OrganizerEventRow): OrganizerEvent {
  return {
    id: row.event_id,
    title: row.title,
    startsAt: row.starts_at,
    place: row.place,
    maxCapacity: row.max_capacity,
    registeredCount: row.registered_count,
  };
}

export function mapRegistrationTrendPoint(row: RegistrationTrendRow): RegistrationTrendPoint {
  return {
    date: row.registration_date,
    count: row.registration_count,
  };
}

export function mapEventDashboard(rows: OrganizerEventDashboardRow[]): EventDashboard | null {
  const firstRow = rows[0];
  if (!firstRow) return null;

  const ticketTypes = new Map<string, EventDashboard["ticketTypes"][number]>();
  const registrations = new Map<string, EventDashboard["registrations"][number]>();

  for (const row of rows) {
    if (row.ticket_type_id && row.ticket_type_name && row.ticket_type_capacity !== null) {
      ticketTypes.set(row.ticket_type_id, {
        id: row.ticket_type_id,
        name: row.ticket_type_name,
        maxCapacity: row.ticket_type_capacity,
        registeredCount: row.registered_count,
      });
    }

    if (
      row.registration_id &&
      row.attendee_name &&
      row.attendee_email &&
      row.registered_at &&
      row.ticket_type_id &&
      row.ticket_type_name
    ) {
      registrations.set(row.registration_id, {
        id: row.registration_id,
        attendeeName: row.attendee_name,
        attendeeEmail: row.attendee_email,
        createdAt: row.registered_at,
        ticketTypeId: row.ticket_type_id,
        ticketTypeName: row.ticket_type_name,
        ticketCode: row.ticket_code,
        ticketStatus: row.ticket_status,
      });
    }
  }

  const registrationList = Array.from(registrations.values());

  return {
    event: {
      id: firstRow.event_id,
      title: firstRow.event_title,
      startsAt: firstRow.event_starts_at,
      place: firstRow.event_place,
      maxCapacity: firstRow.event_max_capacity,
      registeredCount: registrationList.length,
    },
    ticketTypes: Array.from(ticketTypes.values()),
    registrations: registrationList,
  };
}

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
