# Ejemplos canónicos

Usa estos ejemplos como contratos de resultado, no como autorización para modificar áreas ajenas a la solicitud.

## Tabla de asistentes

Solicitud representativa: “Añade una tabla de asistentes al detalle del evento”.

Resultado esperado:

- El encabezado y la obtención inicial permanecen en el Server Component cuando sea posible.
- El filtro local se aísla en el menor Client Component.
- Las columnas son Asistente, Entrada, Registro, Estado y Acciones.
- La primera celda muestra nombre y correo; las cantidades o códigos usan la fuente de datos.
- La región implementa `loading`, `error`, `empty`, `no-results` y `ready` según `ui-states.md`.
- En móvil cada fila se apila y conserva todas las etiquetas.
- Si el patrón se usa solo en esta ruta, queda junto a ella; al aparecer en otra ruta, se mueve a `components/patterns/`.

No aceptable:

- Un spinner que sustituye toda la página.
- “No hay datos” para colección vacía y filtros sin coincidencias.
- Colores hexadecimales locales para los estados.
- Convertir el layout entero en Client Component para manejar el filtro.

## Formulario de tipo de entrada

Solicitud representativa: “Añade un formulario para crear un tipo de entrada”.

Resultado esperado:

- Orden: nombre, descripción opcional, capacidad y acciones.
- Cada campo usa el contrato `Field`; los errores aparecen junto al campo.
- “Añadir tipo” es la única acción primaria. “Cancelar” usa variante text o secondary.
- Durante la mutación, los valores se conservan y el botón cambia a “Añadiendo…”.
- Un error del proveedor se transforma en copy controlado y no borra lo escrito.
- El espaciado usa exclusivamente la escala autorizada.

No aceptable:

- Placeholders usados como etiquetas.
- Dos botones con el mismo peso visual.
- Crear una paleta o tarjeta distinta para este formulario.

## Listado público de eventos

Solicitud representativa: “Crea el listado público de próximos eventos”.

Resultado esperado:

- La página tiene un `h1`, una introducción breve y una lista dividida; no una cuadrícula genérica de tarjetas.
- Cada fila prioriza título, fecha, lugar, disponibilidad y una sola acción.
- La composición pública usa la misma paleta y tipografía; cambia la densidad, no la identidad.
- La señal de admisión aparece una sola vez y está ligada a disponibilidad o capacidad.
- El vacío explica que todavía no hay eventos publicados, sin ofrecer acciones de organizador.

## Revisión visual

Solicitud representativa: “Revisa si esta pantalla sigue el sistema visual”.

Revisa, en este orden:

1. Valores fuera de tokens.
2. Jerarquía tipográfica y una sola acción primaria.
3. Espaciado fuera de escala.
4. Duplicación o ubicación incorrecta de componentes.
5. Estados de datos incompletos.
6. Teclado, foco, móvil, contenido largo y movimiento reducido.

Reporta hallazgos concretos con archivo y efecto observable. No propongas un rediseño total si una corrección localizada resuelve el incumplimiento.

## Activación esperada

Debe activarse para solicitudes como:

- “Añade una tabla de asistentes al dashboard.”
- “Rediseña el estado vacío de eventos.”
- “Crea la pantalla móvil de una entrada.”
- “Añade skeletons mientras cargan los registros.”
- “Revisa la consistencia visual del formulario.”

No debe activarse para solicitudes limitadas a:

- crear una migración;
- corregir un mapper de Supabase;
- cambiar un email sin UI;
- renombrar tipos compartidos sin efecto visual;
- diagnosticar una ruta API.
