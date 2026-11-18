# ADR 0003 — Paquetes compartidos como TypeScript fuente y enlazado aislado de pnpm

- **Estado:** aceptado
- **Fecha:** 2026-11-18
- **Modifica:** [ADR 0001](0001-monorepo.md) (línea sobre `node-linker=hoisted`)

## Contexto

La auditoría de infraestructura pidió confirmar si los paquetes `@v19/*` deben seguir publicándose
como TypeScript fuente o compilarse, y detectó que `node-linker=hoisted` en `.npmrc` no tenía efecto.

- Los paquetes son privados (`"private": true`) y solo los consumen `apps/web` (Next.js, vía
  `transpilePackages`) y `apps/mobile` (Metro, que transpila TS de forma nativa). Ninguno se publica
  en npm ni lo ejecuta Node directamente. `apps/api` es Python y no los consume.
- pnpm ≥ 11 solo lee autenticación desde `.npmrc`; el resto de ajustes va en `pnpm-workspace.yaml`.
  La instalación real ya era _isolated_ (symlinks) y Expo SDK 58 y Next 16 funcionan con ella
  (`pnpm build`, `expo start` y `expo install --check` verificados).

## Decisión

1. **Mantener TypeScript fuente** (`"exports": { ".": "./src/index.ts" }`, sin paso de build).
   Cada paquete solo tiene `typecheck` (`tsc`, `noEmit`) y `lint` (ESLint compartido de `@v19/config`).
2. **Mantener el enlazado aislado por defecto de pnpm** y eliminar `.npmrc` (su única línea era
   `node-linker=hoisted`, ignorada).

## Consecuencias

- Sin builds intermedios ni modo watch: un cambio en un paquete se ve al instante en web y mobile.
- Los paquetes deben usar solo sintaxis/TS que entiendan ambos bundlers y no deben depender de
  APIs de Node ni del DOM más allá de lo común (fetch, etc.).
- **Revisar esta decisión** si un paquete se publica, si lo debe ejecutar Node sin bundler (scripts,
  Edge Functions, otro servicio) o si el typecheck de las apps se vuelve lento: en ese caso compilar con
  `tsup`/`tsc -b` a `dist/` (el `outputs: ["dist/**"]` de `turbo.json` ya lo contempla).
- Si alguna dependencia nativa de Expo fallara con el enlazado aislado, se fijaría
  `nodeLinker: hoisted` en `pnpm-workspace.yaml` (no en `.npmrc`).
