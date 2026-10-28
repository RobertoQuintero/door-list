# Estados de datos y mutaciones

Modela los estados de forma explícita y mutuamente excluyente. No uses una lista vacía para representar a la vez carga, error y ausencia de datos.

## Colecciones

| Estado | Condición | Presentación | Semántica |
| --- | --- | --- | --- |
| `loading` | La primera carga no terminó | Estructura estable y skeletons | `aria-busy="true"` y texto de estado |
| `error` | La carga falló | Mensaje controlado y recuperación | `role="alert"` |
| `empty` | Carga correcta, colección original vacía | Invitación a crear o registrar | Región con título y explicación |
| `no-results` | Hay datos, pero ningún resultado coincide | Indicación de filtros activos | Acción “Limpiar filtros” |
| `ready` | Hay resultados visibles | Tabla o lista | Sin anuncio redundante |

## Carga

Una tabla conserva el encabezado y muestra cinco filas skeleton con la misma retícula de columnas. Una lista conserva tres filas. Un formulario enviado conserva sus campos, deshabilita la acción primaria y cambia su texto a un verbo en progreso, como “Guardando…”.

Incluye texto accesible específico: “Cargando asistentes…”, “Cargando eventos…” o equivalente. No uses solo “Cargando…”. No reemplaces toda la página por un spinner si el encabezado y la navegación ya son estables.

## Vacío inicial

El mensaje describe qué falta, dónde aparecerá y qué puede hacer la persona:

```text
Aún no hay asistentes
Los registros confirmados aparecerán aquí.
[Copiar enlace de registro]
```

Variantes autorizadas por entidad:

- Eventos: “Aún no hay eventos” / “Crea el primer evento para empezar a recibir registros.” / “Crear evento”.
- Tipos de entrada: “Aún no hay tipos de entrada” / “Añade al menos uno para abrir el registro.” / “Añadir tipo”.
- Asistentes: ejemplo anterior.

No uses “No hay datos”, “Vacío” ni una disculpa.

## Sin resultados

```text
No hay coincidencias
Prueba con otro nombre, correo o filtro.
[Limpiar filtros]
```

No muestres la acción de creación en este estado: los datos existen y están ocultos por los filtros.

## Error

Transforma el error del proveedor en un mensaje controlado y ofrece recuperación solo si puede funcionar:

```text
No pudimos cargar los asistentes
Revisa tu conexión e inténtalo de nuevo.
[Reintentar]
```

Para errores de validación, coloca el mensaje junto al campo. Para un error de mutación general, conserva los datos introducidos y muestra el mensaje antes de las acciones. No expongas mensajes, códigos o objetos de Supabase.

## Éxito

Confirma la acción con el mismo verbo del control: “Guardar cambios” produce “Cambios guardados”; “Revocar entrada” produce “Entrada revocada”. No muestres un toast para una actualización que ya queda clara por navegación o cambio de estado visible.

## Accesibilidad y estabilidad

- Usa `aria-live="polite"` para estados de carga y confirmaciones no críticas.
- Usa `role="alert"` para fallos que requieren atención inmediata.
- Conserva el foco en la acción que inició una actualización salvo que aparezca un diálogo o cambie la ruta.
- Evita saltos de layout reservando una altura aproximada durante la carga.
- Los skeletons son decorativos y no deben ser anunciados individualmente.
