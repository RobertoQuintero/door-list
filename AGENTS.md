# Contexto
Asume que la versión instalada de Next.js puede diferir de lo que conoces y consulta su documentación oficial antes de escribir código del framework.
Usa Server Components por defecto y añade `"use client"` solo cuando exista una necesidad concreta de estado, efectos, eventos o APIs del navegador.

# Estructura
Coloca las rutas en `app/`, la UI compartida en `components/`, la lógica y las utilidades compartidas en `lib/`, los clientes de Supabase en `lib/supabase/` y el esquema de base de datos en migraciones dentro de `supabase/migrations/`.
Coloca junto a su ruta todo componente usado únicamente por esa ruta y muévelo a `components/` cuando lo usen dos o más rutas.

# Vocabulario
Usa `Event`, `TicketType`, `Ticket` y `Registration` con un significado único y consistente en todo el repositorio y no los uses como sinónimos entre sí.
Nombra las tablas en plural y `snake_case` según su entidad: `events`, `ticket_types`, `tickets`, `registrations`.

# Idioma
Escribe el código, los nombres y los tipos en inglés, y el copy de la interfaz en español.
Nombra en español las rutas públicas y en inglés los componentes que las sirven.

# Casing
Usa `snake_case` únicamente dentro de la capa de persistencia.
Define en `camelCase` todos los contratos de API, tanto de request como de response.

# Fuente única de verdad
Define en `lib/` los tipos compartidos entre API, email y UI, y reutilízalos en lugar de redefinirlos por archivo.
Define en `lib/` los helpers compartidos de fecha y formato, y reutilízalos en lugar de copiarlos entre pantallas.

# Errores
Devuelve toda respuesta de error de la API como JSON con la forma `{ error: string }`.
Devuelve los errores de negocio con su código HTTP real y nunca con `200`.
Comprueba `response.ok` en el cliente antes de interpretar el cuerpo de la respuesta.
Transforma los errores del proveedor en mensajes controlados antes de mostrarlos en la UI.

# Base de datos
Registra toda migración en un archivo versionado dentro de `supabase/migrations/` y no ejecutes ni conserves SQL suelto fuera de una migración versionada.
Habilita RLS en toda tabla expuesta.
