import assert from "node:assert/strict";
import test from "node:test";
import {
  createAttendeesCsv,
  getAttendeesCsvFilename,
  isActiveRegistration,
} from "../lib/export/attendees-csv.js";

const registrations = [
  {
    attendeeName: 'Ana "La Jefa" Pérez, Jr.',
    attendeeEmail: "ana@example.com",
    ticketTypeName: "General",
    ticketCode: "ABC-123",
    createdAt: "2026-10-28T18:30:00.000Z",
    ticketStatus: "valid",
  },
  {
    attendeeName: "Ticket revocado",
    attendeeEmail: "revocado@example.com",
    ticketTypeName: "General",
    ticketCode: "REVOKED-123",
    createdAt: "2026-10-28T18:30:00.000Z",
    ticketStatus: "revoked",
  },
];

test("genera CSV UTF-8 con BOM y escapa comas, comillas y saltos de línea", () => {
  const csv = createAttendeesCsv([{ ...registrations[0], attendeeName: `${registrations[0].attendeeName}\nEquipo puerta` }]);

  assert.ok(csv.startsWith("\uFEFFNombre,Email,Tipo de entrada,Código de ticket,Fecha de compra,Estado del ticket\r\n"));
  assert.match(csv, /"Ana ""La Jefa"" Pérez, Jr\.\nEquipo puerta"/);
  assert.match(csv, /,Vigente\r\n$/);
});

test("un CSV sin asistentes contiene únicamente encabezados", () => {
  assert.equal(
    createAttendeesCsv([]),
    "\uFEFFNombre,Email,Tipo de entrada,Código de ticket,Fecha de compra,Estado del ticket\r\n",
  );
});

test("las entradas revocadas no se cuentan como activas ni se exportan", () => {
  assert.equal(registrations.filter(isActiveRegistration).length, 1);

  const csv = createAttendeesCsv(registrations);
  assert.match(csv, /Ana/);
  assert.doesNotMatch(csv, /Ticket revocado|REVOKED-123|revocado@example\.com/);
});

test("el nombre de archivo usa el título normalizado y la fecha de Ciudad de México", () => {
  assert.equal(
    getAttendeesCsvFilename("Fiesta de Año: ¡Puerta #1!", new Date("2026-10-28T02:00:00.000Z")),
    "asistentes-fiesta-de-ano-puerta-1-2026-10-27.csv",
  );
});

test("una respuesta vacía produce un archivo sin asistentes", () => {
  const csv = createAttendeesCsv([]);
  assert.doesNotMatch(csv, /@|ABC-123|Ana/);
});
