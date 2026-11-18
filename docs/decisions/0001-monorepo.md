# ADR 0001 — Monorepo con Turborepo + pnpm

- **Estado:** aceptado
- **Fecha:** 2026-11-18

## Contexto
El producto tiene web (Next.js), app móvil (Expo) y una API (FastAPI) que comparten modelos de
dominio, validaciones, traducciones y acceso a Supabase.

## Decisión
- Un único repositorio con **pnpm workspaces** (`apps/*`, `packages/*`).
- **Turborepo** orquesta `dev`, `build`, `lint`, `typecheck` y `test` con caché.
- Paquetes internos `@v19/*` publicados como TS fuente (sin paso de build).
- `node-linker=hoisted` en `.npmrc` para compatibilidad con Metro/Expo.
- La API Python se gestiona con **uv** y se integra en Turborepo mediante un `package.json` puente.

## Consecuencias
- Cambios en tipos compartidos se reflejan al instante en web y mobile.
- Los tipos Python no se generan desde TS: hay que mantener los esquemas Pydantic alineados
  (alternativa futura: generar el cliente TS desde el OpenAPI de FastAPI).
