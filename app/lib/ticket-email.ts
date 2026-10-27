import QRCode from "qrcode";
import { Resend } from "resend";

type TicketEmailData = {
  registrationId: string;
  ticketCode: string;
  attendeeName: string;
  attendeeEmail: string;
  eventTitle: string;
  eventStartsAt: string;
  eventPlace: string;
  ticketTypeName: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Mexico_City",
  }).format(new Date(value));
}

function emailHtml(ticket: TicketEmailData, date: string) {
  const name = escapeHtml(ticket.attendeeName);
  const event = escapeHtml(ticket.eventTitle);
  const place = escapeHtml(ticket.eventPlace);
  const ticketType = escapeHtml(ticket.ticketTypeName);

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;background:#eef1f4;color:#17202a;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Tu entrada para ${event} ya está lista.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef1f4;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #d7dde3;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:32px 34px 18px;">
                <p style="margin:0 0 10px;color:#637083;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Entrada confirmada</p>
                <h1 style="margin:0;color:#111820;font-size:30px;line-height:1.15;">${event}</h1>
                <p style="margin:14px 0 0;color:#4c5968;font-size:16px;line-height:1.6;">Hola ${name}, presenta este QR en el acceso.</p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:18px 34px 24px;">
                <div style="display:inline-block;padding:14px;background:#ffffff;border:2px solid #111820;border-radius:16px;">
                  <img src="cid:ticket-qr" width="260" height="260" alt="Código QR de tu entrada" style="display:block;width:260px;max-width:100%;height:auto;" />
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 34px 32px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e2e7ec;">
                  <tr><td style="padding:18px 0 4px;color:#637083;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Fecha</td></tr>
                  <tr><td style="padding:0 0 14px;color:#17202a;font-size:16px;font-weight:700;">${escapeHtml(date)}</td></tr>
                  <tr><td style="padding:0 0 4px;color:#637083;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Lugar</td></tr>
                  <tr><td style="padding:0 0 14px;color:#17202a;font-size:16px;font-weight:700;">${place}</td></tr>
                  <tr><td style="padding:0 0 4px;color:#637083;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Tipo de entrada</td></tr>
                  <tr><td style="padding:0;color:#17202a;font-size:16px;font-weight:700;">${ticketType}</td></tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 34px;background:#17202a;color:#ffffff;font-size:13px;line-height:1.5;">Guarda este correo y no compartas tu QR. Cada entrada es única.</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendTicketEmail(ticket: TicketEmailData) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("Resend is not configured");

  const date = formatEventDate(ticket.eventStartsAt);
  const qr = await QRCode.toBuffer(ticket.ticketCode, {
    type: "png",
    width: 520,
    margin: 3,
    errorCorrectionLevel: "M",
    color: { dark: "#111820", light: "#ffffff" },
  });

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: ticket.attendeeEmail,
    subject: `Tu entrada para ${ticket.eventTitle}`,
    html: emailHtml(ticket, date),
    text: [
      `Hola ${ticket.attendeeName},`,
      "",
      `Tu entrada para ${ticket.eventTitle} está confirmada.`,
      `Fecha: ${date}`,
      `Lugar: ${ticket.eventPlace}`,
      `Tipo de entrada: ${ticket.ticketTypeName}`,
      "",
      "El código QR está incluido como imagen en este correo. Guárdalo y no lo compartas.",
    ].join("\n"),
    attachments: [{
      content: qr,
      filename: "entrada-qr.png",
      contentType: "image/png",
      contentId: "ticket-qr",
    }],
  }, {
    idempotencyKey: `ticket-confirmation/${ticket.registrationId}`,
  });

  if (error) throw new Error(error.message);
  return data?.id ?? null;
}
