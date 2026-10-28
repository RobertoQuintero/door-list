# Sistema visual

Door List es una herramienta de control de acceso inspirada en manifiestos, boletos y señalización de backstage. Su carácter proviene de jerarquías contundentes, datos monoespaciados y un acento de alta visibilidad. No añadas gradientes decorativos, vidrio esmerilado, radios suaves o sombras difusas.

## Paleta

Declara estos tokens una sola vez en `app/globals.css` y consúmelos mediante `var(...)`:

| Token | Valor | Uso |
| --- | --- | --- |
| `--ui-canvas` | `#f3f0e8` | Fondo general |
| `--ui-surface` | `#fffdf7` | Paneles, formularios y tablas |
| `--ui-ink` | `#171713` | Texto y bordes de énfasis |
| `--ui-muted` | `#69655d` | Texto secundario |
| `--ui-line` | `#b8b2a6` | Divisores y bordes normales |
| `--ui-primary` | `#2948c7` | Acción primaria y foco |
| `--ui-primary-hover` | `#20379a` | Hover de acción primaria |
| `--ui-accent` | `#d8ff3f` | Acento de admisión o capacidad |
| `--ui-danger` | `#a33c32` | Error, revocación y destrucción |
| `--ui-success` | `#247344` | Confirmación y entrada válida |

Se permiten blanco con alpha y mezclas derivadas de estos tokens solo cuando la relación sea evidente, por ejemplo `rgb(255 255 255 / 32%)`. No introduzcas otro hexadecimal para aproximar un token. El acento lima no se usa como fondo de secciones completas ni como color de texto corrido.

## Tipografía

Usa familias disponibles sin añadir una dependencia de fuentes salvo que el usuario lo pida:

```css
--font-display: Arial, Helvetica, sans-serif;
--font-body: Arial, Helvetica, sans-serif;
--font-data: "Courier New", Courier, monospace;
```

Escala autorizada:

| Rol | Tamaño | Peso | Interlineado | Tracking |
| --- | --- | --- | --- | --- |
| `utility` | `0.75rem` | `700` | `1.3` | `0.06em` |
| `body-sm` | `0.875rem` | `400` | `1.5` | `0` |
| `body` | `1rem` | `400` | `1.5` | `0` |
| `title-sm` | `1.25rem` | `800` | `1.1` | `-0.03em` |
| `title` | `clamp(2rem, 4vw, 3.5rem)` | `800` | `0.95` | `-0.065em` |
| `display` | `clamp(3.5rem, 9vw, 7.8rem)` | `800` | `0.82` | `-0.085em` |

Usa `font-data` para fechas, capacidades, códigos, estados, encabezados de tabla y etiquetas breves. Usa mayúsculas solo en esas etiquetas; el copy normal permanece en sentence case. Los títulos públicos y operativos comparten la misma familia display.

## Espaciado y dimensiones

Usa únicamente esta escala para `gap`, margen y padding:

```text
0, 0.25rem, 0.5rem, 0.75rem, 1rem, 1.5rem, 2rem, 3rem, 4rem, 5rem
```

Los valores fluidos deben tener extremos de la escala, por ejemplo `clamp(2rem, 6vw, 5rem)`. No uses `18px`, `22px` u otros valores intermedios para ajustar visualmente una sola pantalla.

- Ancho de lectura: `42rem`.
- Ancho de formulario: `38rem`.
- Ancho de workspace: `88rem`.
- Altura mínima de controles: `2.75rem`.
- Padding horizontal móvil: `1rem` o `1.25rem`.

## Bordes, forma y elevación

- Radio: `0`. Los recortes circulares de boleto son una excepción semántica, no un radio de componente.
- Borde normal: `1px solid var(--ui-line)`.
- Borde de énfasis: `2px solid var(--ui-ink)`.
- Foco: `3px solid var(--ui-primary)` con `3px` de separación.
- Elevación de marca: `0.75rem 0.75rem 0 var(--ui-primary)`; úsala solo en una tarjeta protagonista, no en cada panel.

## Composición

- Las superficies del organizador priorizan densidad, escaneo y comparación: encabezado compacto, métricas, divisores y tablas.
- Las superficies públicas priorizan una acción y lectura lineal: título, información esencial, elección y acción.
- El elemento distintivo es la señal de admisión: perforación, muesca o franja segmentada. Úsalo una vez por vista y solo asociado a boleto, aforo o validación.
- Evita tarjetas repetidas cuando una lista dividida o una tabla comunica mejor la relación entre registros.

## Movimiento y responsive

- Transición interactiva: `160ms ease` en color, fondo, desplazamiento o sombra; no animes todo con `transition: all`.
- Con movimiento reducido, elimina desplazamientos y animaciones; conserva el cambio de color o borde.
- Puntos de adaptación preferidos: `900px`, `650px` y `480px`. Añade otro solo si el contenido demuestra la necesidad.
- Una tabla pasa a filas apiladas bajo `650px`; cada celda muestra su encabezado mediante una etiqueta accesible y visible.
