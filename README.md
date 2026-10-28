# Door List

Door List es una aplicación para publicar eventos, registrar asistentes y operar el acceso desde un panel de organizadora. Está construida con Next.js, Supabase y Resend.

## Funcionalidades

### Experiencia pública

- Listado de eventos publicados.
- Registro de asistentes por tipo de entrada, con validación de nombre y correo.
- Control de cupo por evento y por tipo de entrada.
- Emisión automática de un ticket con código único y código QR.
- Página pública de ticket con estados vigente, usada o revocada.
- Envío del ticket por correo cuando Resend está configurado.

### Panel de organizadora

- Inicio de sesión mediante Supabase Auth.
- Creación y administración de eventos y tipos de entrada.
- Panel por evento con total de registros y capacidad disponible.
- Tendencia de registros por día.
- Indicadores por tipo de entrada: vendidas / cupo y barra de progreso.
- Lista nominal de asistentes activos.
- Descarga de asistentes en CSV para el equipo de puerta:
  - Incluye nombre, email, tipo de entrada, código de ticket, fecha de compra y estado.
  - El archivo usa UTF-8 con BOM para compatibilidad con Excel.
  - Escapa correctamente comas, comillas dobles y saltos de línea.
  - Se llama `asistentes-{slug-del-evento}-{YYYY-MM-DD}.csv`.
  - Las entradas revocadas no aparecen ni cuentan como vendidas.

## Stack

- Next.js 16 con App Router y React 19.
- Supabase para Auth, Postgres, RLS y funciones SQL.
- Resend para correo de tickets.
- QRCode para los códigos QR de entradas.
- TypeScript, ESLint y Tailwind CSS.

## Requisitos

- Node.js 20 o superior.
- npm.
- Docker y Supabase CLI si usarás la base local.
- Un proyecto de Supabase para el entorno remoto.
- Una cuenta de Resend si quieres enviar correos reales.

## Puesta en marcha

Instala las dependencias:

```bash
npm install
```

Crea `.env.local` desde el ejemplo y completa sus valores:

```powershell
Copy-Item .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key

RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

`RESEND_API_KEY` y `RESEND_FROM_EMAIL` son opcionales durante el desarrollo: el registro y el ticket siguen funcionando, pero no se enviará correo.

Inicia el servidor:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Base de datos y seguridad

Las migraciones versionadas están en `supabase/migrations/`. Definen las tablas `events`, `ticket_types`, `registrations` y `tickets`, además de funciones SQL para disponibilidad, registro, tickets y panel de organizadora.

Para levantar Supabase localmente y aplicar todas las migraciones:

```bash
npx supabase start
npx supabase db reset
```

Las tablas expuestas tienen RLS habilitado. Los datos nominales de asistentes y tickets no se leen directamente desde el navegador: el panel usa funciones de reporte delimitadas por la identidad autenticada de la organizadora. No se utiliza la service role key en la aplicación.

## Rutas principales

| Ruta | Propósito |
| --- | --- |
| `/` | Listado público de eventos. |
| `/eventos` | Redirección al listado público. |
| `/eventos/[eventId]/registro` | Registro público a un evento. |
| `/entradas/[code]` | Ticket público y código QR. |
| `/organizador` | Administración de eventos y tipos de entrada. |
| `/dashboard` | Panel de la organizadora. |
| `/dashboard/eventos/[eventId]` | Métricas, asistentes y descarga CSV del evento. |

## Estructura

```text
app/                    Rutas, pantallas y endpoints de Next.js
components/             Componentes compartidos, incluida la sesión del dashboard
lib/                    Tipos, formato, mappers y utilidades de exportación
lib/export/             Generación de CSV de asistentes
supabase/migrations/    Esquema, RLS, triggers y funciones SQL versionadas
tests/                  Pruebas nativas de la exportación CSV
```

## Comandos de calidad

```bash
npm run lint
npm run build
node --test tests/attendees-csv.test.mjs
```

El proyecto no define un script `npm test`; las pruebas actuales usan el runner nativo de Node. Cubren BOM UTF-8, encabezados, campos con comas/comillas/saltos de línea, archivo vacío, exclusión de entradas revocadas y nombre del archivo descargado.

## Convenciones relevantes

- La interfaz se escribe en español; código, tipos y contratos técnicos, en inglés.
- Los contratos de API usan `camelCase`; la capa de persistencia usa `snake_case`.
- `Event`, `TicketType`, `Ticket` y `Registration` representan entidades distintas.
- Las respuestas de error de API tienen la forma `{ error: string }`.
- Los componentes de servidor son el valor predeterminado; se usan componentes cliente solo para interacción, sesión o APIs del navegador.
