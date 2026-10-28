---
name: door-list-ui
description: Diseña, implementa o revisa interfaces visibles de Door List con su sistema visual y sus contratos de componentes. Úsalo al modificar páginas, layouts, formularios, tablas, navegación, estados de datos o comportamiento responsive; no lo uses para tareas limitadas a API, base de datos, migraciones, email o lógica sin cambios visibles.
---

# Door List UI

Aplica una sola identidad de producto a cualquier UI que se cree o modifique. Conserva el alcance pedido y las reglas del `AGENTS.md` aplicable; no refactorices pantallas no relacionadas solo para adoptar el sistema.

## Antes de implementar

1. Identifica la audiencia y el trabajo principal de la pantalla: operación del organizador o acceso del asistente.
2. Inspecciona los componentes y estilos existentes antes de crear otros.
3. Consulta la documentación oficial de la versión instalada de Next.js antes de escribir código del framework, como exige `AGENTS.md`.
4. Lee [references/visual-system.md](references/visual-system.md) para toda tarea visual.
5. Lee [references/component-contracts.md](references/component-contracts.md) cuando crees, reorganices o reutilices componentes.
6. Lee [references/ui-states.md](references/ui-states.md) cuando la vista dependa de datos, mutaciones o filtros.
7. Lee [references/examples.md](references/examples.md) cuando implementes tablas, formularios, listados o revises si una solución cumple el sistema.

## Invariantes

- Deriva color, tipografía, espaciado, bordes, sombras y movimiento de los tokens del sistema; no inventes valores casi equivalentes.
- Mantén una sola paleta y jerarquía tipográfica. Las superficies pública y de organizador pueden variar su composición, no crear otra identidad.
- Usa el motivo de boleto o control de acceso solo cuando comunique admisión, capacidad o estado; no como decoración arbitraria.
- Mantén una acción primaria por región y usa copy de interfaz en español, específico y accionable.
- Incluye `hover`, `focus-visible`, `disabled` y los estados semánticos aplicables. Respeta `prefers-reduced-motion`.
- No uses selectores globales de elementos para resolver estilos locales ni aumentes especificidad para corregir colisiones; limita los estilos a una raíz de superficie o componente.

## Estructura

- Mantén junto a una ruta los componentes usados solo por ella y mueve a `components/` los usados por dos o más rutas.
- Coloca primitivas compartidas en `components/ui/` y composiciones compartidas en `components/patterns/` cuando esas carpetas existan o la tarea justifique crearlas.
- No extraigas un componente que solo envuelva una etiqueta sin aportar semántica, variantes, comportamiento o reutilización.
- Usa Server Components por defecto y crea la frontera cliente más pequeña que permita estado, efectos, eventos o APIs del navegador.
- Mantén los tokens globales en `app/globals.css`. Conserva el mecanismo de estilos del área tocada salvo que el usuario autorice una migración más amplia.

## Estados de datos

Toda región remota debe distinguir `loading`, `error`, `empty` y `ready`. Una colección filtrable también debe distinguir `no-results` de `empty`. Conserva la geometría de la región durante la carga y ofrece una acción de recuperación cuando exista.

## Definición de terminado

- La implementación reutiliza tokens y patrones autorizados, sin colores ni espaciados ad hoc.
- Están presentes todos los estados de datos aplicables con el copy y la semántica definidos.
- El componente está colocado según su alcance real y la frontera cliente es mínima.
- La interfaz funciona con teclado, contenido largo, móvil y movimiento reducido.
- No se alteraron superficies ajenas a la solicitud.
- Pasan el lint y las verificaciones pertinentes del proyecto.
