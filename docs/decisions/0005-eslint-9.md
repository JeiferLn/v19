# ADR 0005 — Mantener ESLint 9 hasta que Next y Expo soporten ESLint 10

- **Estado:** aceptado
- **Fecha:** 2026-11-18

## Contexto

`pnpm install` avisa: `deprecated eslint@9.39.5. 10.15.0 is not deprecated`. Toda la serie 9.x está
marcada como deprecated. Sin embargo, `eslint-config-next@16.4.6` y `eslint-config-expo@58.0.4`
incluyen `eslint-plugin-react@7.37` y `eslint-plugin-import@2.32`, cuyos `peerDependencies` solo
aceptan `eslint ^9`. Subir a ESLint 10 cambiaría el aviso por incompatibilidades de peers (y
`pnpm peers check` fallaría) con riesgo de reglas que dejen de funcionar.

## Decisión

- Fijar `eslint ~9.39.5` en todos los `package.json` (apps, paquetes y peer de `@v19/config`).
- El aviso de deprecated de `pnpm install` es **conocido y aceptado**; es el único aviso esperado.

## Condición de revisión

Migrar a ESLint 10 cuando `eslint-config-next` y `eslint-config-expo` publiquen versiones cuyos
plugins acepten `eslint ^10` (comprobar con `pnpm view eslint-plugin-react peerDependencies`).
La migración se valida con `pnpm peers check` y `pnpm lint` sin cambios en los resultados.
