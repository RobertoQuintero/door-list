---
name: Door List
description: Sistema operativo de registro y acceso para eventos.
colors:
  canvas: "#f3f0e8"
  surface: "#fffdf7"
  ink: "#171713"
  muted: "#69655d"
  line: "#b8b2a6"
  action-blue: "#2948c7"
  action-blue-hover: "#20379a"
  availability-lime: "#d8ff3f"
  danger: "#a33c32"
  success: "#247344"
typography:
  display:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "clamp(3.5rem, 9vw, 7.8rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.085em"
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Courier New, Courier, monospace"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.06em"
spacing:
  compact: "0.5rem"
  control: "0.75rem 1rem"
  section: "clamp(2.5rem, 6vw, 5rem)"
  page: "clamp(2rem, 6vw, 5rem)"
components:
  button-primary:
    backgroundColor: "{colors.action-blue}"
    textColor: "{colors.surface}"
    typography: "{typography.body}"
    padding: "0.75rem 1rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.action-blue-hover}"
  ticket-option-selected:
    backgroundColor: "{colors.surface}"
    rounded: "0"
  status-valid:
    textColor: "{colors.success}"
    padding: "0.35rem 0.55rem"
---

# Design System: Door List

## Overview

**Creative North Star: "Mesa de control de acceso"**

Door List se comporta como una mesa de control para una puerta real: cada acción, capacidad y estado se presenta con contraste alto, lectura rápida y estructura inequívoca. El diseño favorece listas, manifiestos y bloques de información antes que superficies decorativas o ambientes promocionales.

La interfaz usa una composición editorial-operativa: titulares sans muy pesados para orientar la vista, etiquetas monoespaciadas para datos y una retícula de líneas, columnas y bloques rectos. El azul y el lima no decoran; son señales de alta visibilidad para acción y disponibilidad.

**Key Characteristics:**

- Densidad cómoda, con información agrupada en estructuras escaneables.
- Contraste firme entre papel cálido, tinta oscura y señales cromáticas.
- Datos, estados y capacidad expresados con etiquetas monoespaciadas.
- Profundidad plana y funcional; la jerarquía nace de bordes, separadores y color.

## Colors

La paleta se comporta como señalización operativa sobre una base de papel cálido y tinta casi negra.

### Primary

- **Azul de acción**: reservar para acciones primarias, enlaces relevantes, foco y datos activos.
- **Azul de acción activo**: usar únicamente al pasar el cursor o activar acciones primarias.

### Secondary

- **Lima de disponibilidad**: señala aforo, disponibilidad y elementos que requieren detección inmediata.

### Neutral

- **Papel operativo**: fondo base de las vistas y contraste cálido contra la tinta.
- **Superficie de lectura**: formularios, tickets y áreas de entrada sobre el lienzo.
- **Tinta de control**: encabezados, contornos fuertes y contenido prioritario.
- **Texto auxiliar**: explicaciones, metadatos y datos secundarios.
- **Línea de estructura**: divisores, bordes y guías de lectura.

### Tertiary

- **Rojo de incidencia**: errores, estados revocados y alertas que exigen atención.
- **Verde de confirmación**: registros y tickets válidos confirmados.

**The Signal-Only Rule.** El azul y el lima se usan para información accionable o disponible; nunca como relleno ornamental.

## Typography

**Display Font:** Arial, Helvetica, sans-serif
**Body Font:** Arial, Helvetica, sans-serif
**Label/Mono Font:** Courier New, Courier, monospace

**Character:** Sans pesada y comprimida para orientar con rapidez, acompañada de una monoespaciada utilitaria que da formato de manifiesto a fechas, cantidades y estados.

### Hierarchy

- **Display** (800, `clamp(3.5rem, 9vw, 7.8rem)`, 0.95): titulares de página y contexto principal.
- **Headline** (800, `clamp(2rem, 4vw, 3.5rem)`, 0.95): títulos de eventos y secciones.
- **Title** (700–800, 1.25rem, 1.2): títulos de tarjetas, filas y bloques de datos.
- **Body** (400, 1rem, 1.5): instrucciones y descripciones; mantenerlas concisas y cercanas al objeto que explican.
- **Label** (700, 0.75rem, 1.3, 0.06em): etiquetas en mayúsculas, metadatos y estados.

**The Scan-First Rule.** La monoespaciada marca datos; no se usa para párrafos largos ni titulares.

## Layout

Las páginas públicas y el panel usan un contenedor de hasta 88rem, con respiración adaptable en los bordes. La estructura es una grilla de dos columnas en escritorio —contenido y acción/resumen— que se colapsa a una columna a 650px. Las listas se construyen como filas separadas por líneas; el panel mantiene sus tablas accesibles y las convierte en pares etiqueta-valor en móvil.

El ritmo dominante alterna grupos compactos de 0.5rem con controles de 0.75rem × 1rem y cortes de sección adaptables. Los encabezados terminan con líneas de 2px; la información secundaria no compite con la acción principal.

## Elevation & Depth

El sistema es plano y funcional. La profundidad no depende de tarjetas flotantes: usa bordes, separadores, cambios de superficie y sombras desplazadas de color solo para aislar piezas críticas, como el registro o el acceso al panel.

### Shadow Vocabulary

- **Desplazamiento de acción** (`0.75rem 0.75rem 0`): acompaña tarjetas de registro y acceso para separarlas del lienzo sin suavizar su carácter.

**The Flat-by-Default Rule.** No agregar sombras suaves, difusas ni apiladas; usar profundidad solamente cuando aclare un bloque operativo clave.

## Shapes

La geometría es deliberadamente recta: controles, botones, tarjetas, tablas y etiquetas usan esquinas cuadradas. Los únicos círculos son muescas funcionales de ticket y marcadores visuales de continuidad. Bordes de 1px organizan; bordes de 2px delimitan jerarquía fuerte.

## Components

### Buttons

- **Shape:** rectangular, sin radio; altura mínima de 2.75rem.
- **Primary:** azul de acción, texto de superficie, relleno de control y peso 800.
- **Hover / Focus:** el hover oscurece el azul; el foco usa un contorno azul de 3px con separación de 3px.
- **Secondary / Ghost:** texto o contorno sobre el fondo actual; conservarlos para acciones auxiliares o destructivas explícitas.

### Cards / Containers

- **Corner Style:** esquinas rectas.
- **Background:** superficie de lectura sobre papel operativo.
- **Shadow Strategy:** sombra desplazada de color solo en contenedores de acceso o registro.
- **Border:** 1px para agrupación; 2px para una división de jerarquía.
- **Internal Padding:** adaptable en contenedores principales; 0.75rem × 1rem en controles.

### Inputs / Fields

- **Style:** superficie clara, borde estructural de 1px y altura mínima de 2.75rem.
- **Focus:** contorno azul de 3px separado del control.
- **Error / Disabled:** el error usa rojo de incidencia; el estado no disponible reduce opacidad sin ocultar la información.

### Navigation

La navegación del panel es una barra oscura y estable. Los vínculos activos se señalan con una línea lima; en pantallas pequeñas la navegación continúa en una fila desplazable en vez de desaparecer.

### Ticket Options

Las opciones de entrada son filas completas seleccionables. La opción elegida se reconoce por un borde de 2px y una franja interior lima; agotado conserva su contenido pero reduce la opacidad.

### Status Labels

Los estados de ticket se presentan como etiquetas monoespaciadas con borde de 1px. Verde indica validez, rojo indica uso o revocación y el gris indica un estado pendiente.

## Do's and Don'ts

### Do:

- **Do** usar azul para acciones, foco y datos que el equipo necesita encontrar rápido.
- **Do** usar lima para capacidad y disponibilidad visibles de un vistazo.
- **Do** separar bloques con líneas y retículas antes de introducir contenedores nuevos.
- **Do** conservar la transformación móvil de tablas en pares etiqueta-valor.

### Don't:

- **Don't** usar azul o lima como decoración de fondo sin significado operativo.
- **Don't** añadir radios suaves, sombras difusas o efectos de cristal.
- **Don't** sacrificar contraste o legibilidad por una apariencia de marketing.
- **Don't** ocultar capacidad, estado de ticket o acciones de puerta detrás de interacciones secundarias.
