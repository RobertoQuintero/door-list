const csvHeaders = [
  "Nombre",
  "Email",
  "Tipo de entrada",
  "Código de ticket",
  "Fecha de compra",
  "Estado del ticket",
];

const ticketStatusLabels = {
  valid: "Vigente",
  used: "Usada",
  revoked: "Revocada",
};

/**
 * @typedef {{ attendeeName: string, attendeeEmail: string, ticketTypeName: string, ticketCode: string | null, createdAt: string, ticketStatus: "valid" | "used" | "revoked" | null }} CsvRegistration
 */

/** @param {CsvRegistration} registration */
export function isActiveRegistration(registration) {
  return registration.ticketStatus !== "revoked";
}

/** @param {string} value */
export function escapeCsvField(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** @param {string} value */
export function formatExportDateTime(value) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Mexico_City",
  }).format(new Date(value));
}

/** @param {CsvRegistration[]} registrations */
export function createAttendeesCsv(registrations) {
  const rows = registrations
    .filter(isActiveRegistration)
    .map((registration) => [
      registration.attendeeName,
      registration.attendeeEmail,
      registration.ticketTypeName,
      registration.ticketCode ?? "",
      formatExportDateTime(registration.createdAt),
      registration.ticketStatus ? ticketStatusLabels[registration.ticketStatus] : "Pendiente",
    ]);

  return `\uFEFF${[csvHeaders, ...rows].map((row) => row.map(escapeCsvField).join(",")).join("\r\n")}\r\n`;
}

/** @param {string} title */
export function slugifyEventTitle(title) {
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return slug || "evento";
}

/** @param {Date} date */
export function formatExportFileDate(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Mexico_City",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${values.year}-${values.month}-${values.day}`;
}

/** @param {string} eventTitle @param {Date} [date] */
export function getAttendeesCsvFilename(eventTitle, date = new Date()) {
  return `asistentes-${slugifyEventTitle(eventTitle)}-${formatExportFileDate(date)}.csv`;
}
