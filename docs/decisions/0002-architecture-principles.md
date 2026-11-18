# ADR 0002 — Reglas de arquitectura y fuentes de verdad

- **Estado:** aceptado
- **Fecha:** 2026-11-18

## Contexto

V19 combina dos clientes (Next.js y Expo), un backend propio (FastAPI), Supabase y Shopify. Sin
límites explícitos es fácil duplicar datos de comercio, mover secretos al cliente, solapar FastAPI
con Supabase o copiar lógica entre web y mobile.

## Decisión

Se adoptan como obligatorias las reglas de [`docs/architecture/principles.md`](../architecture/principles.md):

1. Next.js y Expo son aplicaciones independientes.
2. FastAPI es el backend complementario, no un reemplazo de Supabase.
3. Shopify es la fuente de verdad del comercio.
4. Supabase es la fuente de verdad de los datos propios de V19.
5. Los tipos y validaciones compartidas viven en `packages/`.
6. Las credenciales privadas nunca se exponen al cliente.
7. Las operaciones sensibles pasan por servicios backend.
8. No duplicar lógica entre web y mobile.

## Consecuencias

- Toda lectura de comercio pasa por `apps/api`, lo que añade un salto de red; se compensará con
  caché derivada si hace falta (nunca editable).
- La API debe validar el JWT de Supabase antes de exponer operaciones sensibles (pendiente).
- Los cambios que necesiten romper una regla requieren un nuevo ADR que la sustituya.
