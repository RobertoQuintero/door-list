La respuesta honesta: hay algunas convenciones implícitas, pero no una estrategia definida y aplicada de forma consistente. Varias decisiones sí parecen haberse tomado sobre la marcha.

El lint pasa, TypeScript está en modo estricto y la capa SQL es razonablemente consistente. Sin embargo, eso no equivale a tener una arquitectura o una política de errores uniforme.

### Nombres

Hay una base reconocible:

- URLs y textos de producto en español: `/eventos`, `/entradas`, `/organizador`.
- Código TypeScript mayoritariamente en inglés.
- Base de datos en `snake_case`.
- Componentes React normalmente en `PascalCase`.

Pero hay inconsistencias concretas:

- El panel del organizador exporta un componente genérico llamado `Home`, aunque su responsabilidad real es específica. Otras páginas sí usan nombres descriptivos como `PublicEventsPage`, `PublicRegistrationPage` y `PublicTicketPage`: [app/organizador/page.tsx:9](D:/cursos/codex/door-list/app/organizador/page.tsx:9).
- En esa misma página se usan tipos demasiado genéricos, `Event` y `Ticket`, mientras otras áreas usan `PublicEvent`, `PublicTicket` y `PublicRegistrationRow`: [app/organizador/page.tsx:6](D:/cursos/codex/door-list/app/organizador/page.tsx:6).
- El estado de carga se llama simplemente `state` en unas páginas, pero `viewState` y `submissionState` en registro. La segunda opción comunica mucho mejor la intención.
- Hay abreviaciones poco claras en el panel: `u`, `e`, `t`, `q`, `l`. En las páginas públicas se emplean nombres como `eventSubmit`, `firstAvailable` y `selectedTicket`: [app/organizador/page.tsx:12](D:/cursos/codex/door-list/app/organizador/page.tsx:12).
- La frontera entre SQL y TypeScript se convierte manualmente: datos SQL en `snake_case`, solicitudes HTTP en `camelCase` y respuestas HTTP mezcladas. Por ejemplo, internamente existe `ticket_code`, pero la API devuelve `ticketCode`. Esto puede ser válido, pero no está formalizado ni centralizado: [app/api/registrations/route.ts:14](D:/cursos/codex/door-list/app/api/registrations/route.ts:14).

### Estructura y estilo del código

La estructura inicial de Next.js es comprensible: rutas dentro de `app`, integraciones compartidas en `app/lib` y base de datos en `supabase/migrations`.

Lo inconsistente aparece al crecer:

- [app/organizador/page.tsx](D:/cursos/codex/door-list/app/organizador/page.tsx:1) concentra autenticación, consultas, mutaciones, validación, estado y toda la interfaz en 27 líneas extremadamente densas.
- En contraste, [app/eventos/[eventId]/registro/page.tsx](D:/cursos/codex/door-list/app/eventos/%5BeventId%5D/registro/page.tsx:1) está formateado y dividido en bloques legibles. Parecen escritos bajo dos estándares distintos.
- No hay carpetas o módulos para componentes, hooks, tipos de dominio, validaciones o acceso a datos. Todo sigue dentro de las páginas hasta que resulta demasiado grande.
- `app/lib` funciona actualmente como carpeta genérica: mezcla la creación del cliente Supabase con generación de HTML, QR y envío de correo.
- `globals.css` contiene estilos históricos, estilos globales y estilos de todas las funciones. Algunas clases están prefijadas por área (`registration-*`, `digital-ticket-*`), mientras el organizador usa nombres globales como `.notice`, `.empty`, `.workspace` y `.danger`. Eso aumenta el riesgo de colisiones.
- El formato CSS también varía: al principio hay reglas multilínea; después aparecen muchas reglas completas comprimidas en una sola línea.
- No hay Prettier ni otra regla declarada de formato. ESLint no está detectando esta disparidad porque ambos estilos pueden ser sintácticamente válidos.
- No existen pruebas ni una organización prevista para ellas.

### Manejo de errores

Aquí está la inconsistencia más importante.

Hay un buen patrón en el flujo público de registro:

- La base de datos devuelve resultados de dominio como `ticket_sold_out`, `duplicate_registration` o `event_not_available`.
- La API evita exponer directamente errores internos.
- El cliente convierte esos códigos en mensajes comprensibles.
- Un fallo de correo no revierte un registro exitoso.

Ese flujo está bastante bien pensado: [app/api/registrations/route.ts:63](D:/cursos/codex/door-list/app/api/registrations/route.ts:63).

Pero no se aplica al resto:

- El panel del organizador muestra frecuentemente `error.message` de Supabase directamente al usuario. Esto expone mensajes técnicos y produce textos en un idioma o formato diferente al resto de la aplicación: [app/organizador/page.tsx:12](D:/cursos/codex/door-list/app/organizador/page.tsx:12).
- El login reemplaza el error por un mensaje amigable, pero el registro de cuenta vuelve a mostrar `error.message`. Dos operaciones adyacentes siguen políticas distintas: [app/organizador/page.tsx:18](D:/cursos/codex/door-list/app/organizador/page.tsx:18).
- Cuando falta Supabase, algunas páginas muestran configuración faltante, otras sólo cambian a un error genérico y varias funciones simplemente hacen `return`.
- `getUser()` ignora por completo su posible error.
- Varias operaciones asíncronas del panel no están protegidas con `try/finally`. Si el cliente lanza una excepción inesperada, `busy` podría permanecer en `true`.
- En el registro público, sólo `fetch()` está dentro del `try`; `response.json()` queda fuera. Una respuesta vacía o no JSON provocaría una excepción no controlada: [app/eventos/[eventId]/registro/page.tsx:95](D:/cursos/codex/door-list/app/eventos/%5BeventId%5D/registro/page.tsx:95).
- Ese mismo cliente no usa `response.ok` ni distingue errores HTTP de respuestas válidas.
- En listado y entrada digital, los errores se convierten en estado visual, pero se descarta completamente la causa. No hay registro que ayude a diagnosticar el problema.
- El servidor usa `console.error` con textos libres. No hay logging estructurado, identificador de solicitud ni contexto uniforme.
- Los estados y respuestas están tipados parcialmente con `string` y conversiones `as`, por lo que TypeScript no garantiza que los códigos devueltos por SQL, API y UI coincidan.

### Veredicto

Diría que la consistencia actual es:

- **SQL y seguridad de Supabase:** bastante buena.
- **Rutas y lenguaje del producto:** razonablemente consistentes.
- **Nombres internos:** parcialmente consistentes.
- **Formato y tamaño de módulos:** claramente inconsistente.
- **Manejo de errores:** consistente sólo en el flujo público más reciente.
- **Convenciones documentadas:** inexistentes.

En resumen: no es un código caótico, pero sí muestra capas construidas en momentos distintos con criterios diferentes. La mayor deuda inmediata está en el panel monolítico del organizador, la ausencia de contratos tipados compartidos y las distintas políticas para presentar, registrar o ignorar errores.