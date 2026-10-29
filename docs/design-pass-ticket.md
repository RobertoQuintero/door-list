# Decisiones de diseño — ticket público

| # | hallazgo | archivo:línea | decisión | razón |
| --- | --- | --- | --- | --- |
| 1 | Privacidad y confianza contradictorias: se muestran el correo completo y el código portador mientras se pide no compartir el enlace. | `app/entradas/[code]/page.tsx:46` |atender  |  |
| 2 | No hay una ruta de recuperación en el momento de acceso: el error solo pide actualizar la página. | `app/entradas/[code]/page.tsx:38` |atender  |  |
| 3 | El QR puede quedar bajo el pliegue en móvil después del estado, título y detalle del evento. | `app/entradas/[code]/page.tsx:44` |atender  |  |
| 4 | Una entrada usada o revocada conserva el QR visible, aunque atenuado, e invita a escanearla. | `app/globals.css:247` |atender  |  |
| 5 | Los datos del ticket no están agrupados según la tarea de acceso: el correo compite con fecha y lugar. | `app/entradas/[code]/page.tsx:46` | atender |  |
