# Contratos de componentes

Estos contratos describen responsabilidades, no obligan a crear todos los componentes por adelantado. Extrae uno cuando aparece en dos rutas o cuando centralizar el contrato evita divergencias reales.

## Ubicación

```text
app/<route>/                 Componentes exclusivos de la ruta
components/ui/               Primitivas compartidas
components/patterns/         Composiciones compartidas con significado de producto
lib/                         Tipos, formato y lógica compartida sin UI
```

No crees un segundo componente compartido con la misma responsabilidad. Amplía variantes del existente si el contrato semántico coincide.

## Primitivas

### `Button`

Variantes autorizadas: `primary`, `secondary`, `danger`, `text`.

- `primary`: fondo primary, texto blanco; una por región.
- `secondary`: superficie transparente, borde ink.
- `danger`: borde y texto danger; requiere una etiqueta que nombre la acción.
- `text`: sin caja; navegación o acción de baja prioridad.
- Todas conservan una etiqueta textual accesible y estados hover, focus y disabled.

No uses un botón de icono para una acción ambigua. Si es necesario, exige `aria-label` específico y un área mínima de `2.75rem`.

### `Field`

Orden fijo: label, control, ayuda opcional, error. El error sustituye la ayuda y se asocia mediante `aria-describedby`. No uses placeholder como label.

### `StatusBadge`

Representa estados de dominio, no categorías decorativas. Variantes: `success`, `danger`, `neutral`. El texto siempre acompaña al color: “Válida”, “Usada”, “Revocada” o “Pendiente”.

## Patrones

### `PageHeader`

Contiene, en este orden: kicker opcional, `h1`, descripción opcional y acciones. Solo existe un `h1`. En móvil, las acciones pasan debajo del texto y ocupan el ancho cuando mejora la operación.

### `DataRegion`

Posee el estado de una colección: `loading`, `error`, `empty`, `no-results` o `ready`. No distribuyas condicionales de estado entre encabezado, tabla y pie. Consulta `ui-states.md`.

### `EmptyState`

Orden fijo: título, explicación de una frase y acción opcional. No usa ilustraciones genéricas, iconos de archivo ni lenguaje vago.

### `DataTable`

- Encabezados alineados con sus datos.
- Texto a la izquierda; cantidades y capacidad a la derecha; estados en una columna dedicada.
- La primera columna identifica el registro y puede mostrar un dato secundario.
- Acciones en la última columna y con nombre accesible.
- En móvil, cada fila se convierte en un bloque y conserva las etiquetas de columna.
- La carga conserva columnas y altura mediante skeletons; el vacío ocupa todo el ancho dentro del límite de la tabla.

### `CapacityMeter`

Muestra valor actual, máximo y porcentaje. Limita visualmente el ancho al 100 %, aunque los datos excedan la capacidad, y no oculta el valor real. Usa primary en estado normal, danger cuando se rebase el máximo y accent solo para el dato protagonista.

## Fronteras cliente

Mantén la obtención y composición inicial de datos en Server Components cuando la API disponible lo permita. Aísla búsqueda local, filtros, eventos, estado optimista y APIs del navegador en el componente cliente más pequeño. No conviertas el layout o la página completa en cliente porque una tabla necesite filtros.

## CSS

Los tokens viven en `app/globals.css`. Los estilos específicos deben estar limitados por una clase raíz de componente o superficie. Evita reglas globales como `button`, `h1` o `input` para una sola vista: pueden alterar rutas no relacionadas. No dupliques valores de tokens dentro de CSS Modules o archivos de ruta.
