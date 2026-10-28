const locale = "es-MX";
const productTimeZone = "America/Mexico_City";

export function formatEventDateTime(value: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: productTimeZone,
  }).format(new Date(value));
}

export function formatEventDate(value: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: productTimeZone,
  }).format(new Date(value));
}

export function formatRegistrationDateTime(value: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: productTimeZone,
  }).format(new Date(value));
}
