# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Los usuarios principales son organizadores de eventos pequeños y medianos que necesitan publicar sus fechas, gestionar registros y operar el acceso en puerta. Los asistentes reciben un enlace para consultar su entrada, normalmente en una sola ocasión.

## Product Purpose

Door List permite publicar eventos, registrar asistentes y emitir entradas con código QR para que el acceso al evento sea ágil. El éxito del producto es que tanto el registro como el check-in se completen con rapidez y sin fricción.

## Positioning

Un flujo directo de registro y ticket que prioriza la velocidad operativa de la puerta para organizadores de eventos pequeños y medianos.

## Operating Context

Los organizadores crean y administran eventos y tipos de entrada desde un panel, y consultan registros, capacidades, tendencias y listas de asistentes. En el acceso, el equipo de puerta usa el ticket emitido con código único y QR; los asistentes abren su enlace de entrada cuando lo necesitan.

## Capabilities and Constraints

- La aplicación publica eventos, registra asistentes por tipo de entrada, controla capacidad y emite tickets con códigos únicos y QR.
- El panel de organizador permite administrar eventos, entradas, asistentes y exportaciones CSV.
- La plataforma es web y está construida con Next.js, Supabase y Resend.
- La interfaz debe ser directa y operativa: no debe incluir decoración que interfiera con el trabajo en puerta.

## Evidence on Hand

- Implementación existente de listados públicos, registro, tickets, panel de organizador y métricas en `app/`.
- Esquema, políticas y funciones de datos versionados en `supabase/migrations/`.
- No hay testimonios, casos de estudio ni métricas comerciales confirmadas; no deben inventarse.

## Product Principles

- Reducir pasos y ambigüedad en el registro y el acceso.
- Priorizar la velocidad, legibilidad y fiabilidad en el contexto de puerta.
- Mantener a los organizadores en control de su capacidad y lista de asistentes.
- Reservar la atención visual para información y acciones operativas.
