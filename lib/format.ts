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

export function formatRegistrationDay(value: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function formatRegistrationDayShort(value: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
