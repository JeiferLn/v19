# Auditoría de infraestructura — V19

- **Fecha:** 2026-11-18
- **Alcance:** monorepo completo (pnpm + Turborepo, Next.js, Expo, FastAPI, paquetes compartidos,
  Supabase, tooling, entorno, seguridad y Git)
- **Base:** commit `60aae78` más los cambios de esta ronda (pendientes de commit)
- **Resultado:** ✅ **Aprobada.** No quedan problemas críticos, importantes ni menores sin resolver.
  Hay un único aviso conocido y aceptado (ESLint 9 deprecated, [ADR 0005](../decisions/0005-eslint-9.md)).

---

## 1. Resumen ejecutivo

La infraestructura pasó tres rondas:

1. **Primera corrección**: errores de configuración de la auditoría inicial (tsconfig de Next,
   Prettier, icono iOS, Python/uv, ESLint, `.env`, `.gitattributes`).
2. **Segunda auditoría**: 8 problemas importantes y 9 menores, más varias configuraciones faltantes.
3. **Cierre** (este documento): todos los hallazgos de la segunda auditoría quedaron resueltos y
   verificados ejecutando los comandos.

Estado final: compila, pasa lint, typecheck, tests y formato. Las tres apps arrancan de forma
independiente. Los paquetes compartidos se resuelven en web y en mobile (iOS, Android y web). La API
verifica JWT reales de Supabase y el contrato zod ↔ Pydantic se comprueba automáticamente.

---

## 2. Estructura del proyecto

```
v19/  (pnpm 12.9.1 workspaces + Turborepo 2.11.13)
├── .github/workflows/ci.yml   Pipeline de CI
├── apps/
│   ├── web/      @v19/web     Next.js 16.4.6 (App Router, Turbopack, Tailwind 4.3.3)
│   ├── mobile/   @v19/mobile  Expo SDK 58 + Expo Router (rutas en app/, código en src/), eas.json
│   └── api/      @v19/api     FastAPI (uv, Python 3.12); package.json puente para Turbo
├── packages/     TypeScript fuente, sin build (ADR 0003)
│   ├── types/       Tipos de dominio
│   ├── validators/  Esquemas zod + JSON Schema generado (schemas/)
│   ├── env/         Validación de variables públicas (nuevo)
│   ├── api-client/  Cliente HTTP tipado
│   ├── supabase/    Cliente, tipos generados y CLI de Supabase
│   ├── i18n/        i18next es/en
│   └── config/      tsconfig, ESLint y Prettier compartidos
├── scripts/       check-clean.mjs (detección de archivos generados sin commitear)
├── supabase/      config.toml, migraciones, seed
└── docs/          architecture/, api/, decisions/ (ADR 0001–0005), audits/
```

---

## 3. Tecnologías y versiones

| Área                    | Versiones                                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime                 | Node 24 (`.nvmrc`) · pnpm 12.9.1 · uv 0.12.22 · CPython 3.12.15 · Docker 29.7.2                                                                   |
| Web                     | next 16.4.6 · react 19.3.0 · tailwindcss 4.3.3                                                                                                    |
| Mobile                  | expo 58.0.26 · expo-router 58.0.32 · react-native 0.88.1                                                                                          |
| Compartido              | typescript 6.0.3 · zod 4.6.7 · i18next 27.1.5 · @supabase/supabase-js 2.119.1                                                                     |
| Calidad JS              | eslint 9.39.5 (fijado) · typescript-eslint 8.73.0 · prettier 3.x · vitest 5.1.0                                                                   |
| API                     | fastapi 0.165.0 · uvicorn 0.54.0 · pydantic 2.14.3 · pydantic-settings 2.16.3 · httpx 0.28.1 · openai 3.55.1 · pyjwt 2.15.1 · cryptography 50.0.2 |
| Calidad Python          | ruff 0.17.5 · mypy 2.4.1 (strict + plugin pydantic) · pytest 9.2.0 · jsonschema 4.26.0                                                            |
| Supabase                | CLI 3.2.0 (devDependency) · Postgres 17.12 (local) · Auth con JWT ES256                                                                           |
| Shopify (configuración) | Admin API `2026-10` (última estable, soportada hasta oct-2027)                                                                                    |

---

## 4. Hallazgos resueltos

### 4.1 Problemas importantes

| #   | Hallazgo                                                                             | Resolución                                                                                                                                                                                                                  | Verificación                                                        |
| --- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1   | Sin validación de variables de entorno; `createClient("")` rompía mobile al importar | Paquete `@v19/env` (zod) con errores que nombran la variable exacta. Cliente Supabase diferido (`getSupabase()`) en mobile, igual que en web. `Settings` de la API valida `app_env`, `cors_origins` y la versión de Shopify | Tests de `@v19/env`; typecheck; apps arrancan                       |
| 2   | `.env` en la raíz que nadie leía                                                     | Valores repartidos en `apps/web/.env.local`, `apps/mobile/.env.local` y `apps/api/.env` (ignorados por git). `.env` raíz eliminado                                                                                          | `git check-ignore`; apps leen su env                                |
| 3   | Sin CI                                                                               | `.github/workflows/ci.yml`: install congelado, peers, formato, drift de schemas, lint, typecheck, build, test, `expo export`                                                                                                | Pasos ejecutados en local (el workflow aún no ha corrido en GitHub) |
| 4   | Supabase CLI ausente; `database.types.ts` escrito a mano                             | CLI como devDependency con scripts `db:*` y `gen:types`. `config.toml` actualizado (`local_smtp`, PG 17, contraseña mínima 8). Tipos regenerados desde la BD real                                                           | `db:start` aplica migración y seed; `gen:types` OK                  |
| 5   | Sin garantía de alineación zod ↔ Pydantic (regla R5)                                 | `gen:schemas` exporta JSON Schema desde zod. `Product` en Pydantic replica las restricciones. `tests/test_contracts.py` valida respuestas reales. `pnpm check:schemas` detecta drift                                        | 6 tests de contrato                                                 |
| 6   | Shopify `2025-01` (fuera de soporte) y token Admin para el catálogo                  | Versión `2026-10` validada en `Settings`. Estrategia de tokens (Storefront para el catálogo, Admin con scopes mínimos) en el [ADR 0004](../decisions/0004-shopify-tokens-y-versionado.md)                                   | `.env.example` y default actualizados                               |
| 7   | La API no validaba el JWT de Supabase                                                | `app/core/security.py`: `get_current_user` / `CurrentUser` con JWKS, ES256/RS256, `exp`, `aud`, `iss`; 401 en cualquier fallo                                                                                               | 8 tests unitarios + prueba E2E con un token real                    |
| 8   | Expo web con `output: "server"` y AsyncStorage (fallo en SSR)                        | `output: "single"` (SPA); la web real es Next.js                                                                                                                                                                            | `expo export` web OK                                                |

### 4.2 Problemas menores

| #   | Hallazgo                                      | Resolución                                                                                                  |
| --- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 9   | ESLint 9 deprecated                           | Fijado `~9.39.5` en todo el repo; [ADR 0005](../decisions/0005-eslint-9.md) con condición de migración      |
| 10  | Sin `.nvmrc`; `engines` `>=20`                | `.nvmrc` = 24, `engines.node` `>=24`, `@types/node` `^24`                                                   |
| 11  | `X-Powered-By` y sin cabeceras de seguridad   | `poweredByHeader: false` y cabeceras nosniff, `X-Frame-Options: DENY`, Referrer-Policy y Permissions-Policy |
| 12  | `.mcp.json` con `@latest` sin fijar           | Versiones exactas: `@figwright/mcp@0.7.0`, `@astudioplus/codegraph-mcp@0.21.0`                              |
| 13  | Dependencia Python `supabase` sin uso         | Eliminada (`uv remove supabase`)                                                                            |
| 14  | `tsconfig/react-native.json` sin uso          | Eliminado junto con su export                                                                               |
| 15  | `api.ts` de web y mobile divergían (regla R8) | Helper `supabaseTokenGetter` en `@v19/supabase`; ambas apps crean el cliente igual                          |
| 16  | `major_version = 15` en `config.toml`         | 17 (por defecto del CLI actual y de los proyectos nuevos)                                                   |
| 17  | Procesos huérfanos de `pnpm dev` en Windows   | Documentado en el README cómo cerrar y liberar los puertos 3000/8000/8081                                   |

### 4.3 Configuraciones que faltaban (añadidas)

- Validación de env por app (`@v19/env`, `pydantic-settings`).
- Pipeline de CI.
- Supabase CLI y tipos generados.
- `apps/mobile/eas.json` (perfiles development, preview y production).
- `.nvmrc`.
- Tests de JS/TS (Vitest en `validators`, `api-client` y `env`).
- Test de contrato API ↔ `@v19/validators`.
- `.gitignore` para el estado local del CLI de Supabase (`supabase/.branches/`, `supabase/.temp/`).

### 4.4 Primera ronda (ya corregida antes de esta auditoría)

`apps/web/tsconfig.json` sin la sobrescritura de `jsx`; `next-env.d.ts` regenerado por Next; Prettier
en la raíz con `@v19/config`; icono iOS en `./assets/images/icon.png`; Python 3.12 con uv; ruff, mypy y
pytest; scripts de la API integrados en Turbo; lint en los paquetes; ESLint en flat config ESM;
`.gitattributes`; documentación de las rutas de Expo Router; `.npmrc` eliminado (pnpm 12 lo ignoraba);
`allowBuilds` revisado (sharp y unrs-resolver usan binarios precompilados y no necesitan scripts).

---

## 5. Estado de compilación y validaciones

Todo lo de esta tabla se ejecutó realmente en esta ronda.

| Validación                                    | Resultado                                                                                                  |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`              | ✅ Lockfile al día; pasa las supply-chain policies sin excepciones nuevas                                  |
| `pnpm peers check`                            | ✅ Sin problemas de peer dependencies                                                                      |
| `pnpm format:check`                           | ✅ Todo el repo cumple el estilo de Prettier                                                               |
| `turbo run lint typecheck build test --force` | ✅ 23/23 tareas                                                                                            |
| Vitest                                        | ✅ 14 tests (validators 8, api-client 4, env 2)                                                            |
| pytest                                        | ✅ 16 tests (health y productos, JWT 8, contratos 6)                                                       |
| ruff · mypy strict                            | ✅ Sin problemas en 25 archivos                                                                            |
| `expo export --platform all`                  | ✅ Web, Android (3,9 MB) e iOS (3,7 MB)                                                                    |
| Supabase local (`db:start`)                   | ✅ Migración `20261118000000_init.sql` y seed aplicados                                                    |
| `gen:types`                                   | ✅ `database.types.ts` generado desde la BD real                                                           |
| JWT de extremo a extremo                      | ✅ Token real del Supabase local: 200 con el usuario correcto; token manipulado: 401                       |
| Trigger y RLS de `profiles`                   | ✅ El registro crea el perfil; el usuario solo ve el suyo                                                  |
| API (`pnpm --filter @v19/api start`)          | ✅ `/health` 200, `/api/v1/products` válido según el contrato                                              |
| CORS                                          | ✅ Origen permitido: 200; origen desconocido: 400                                                          |
| Web (`next start`)                            | ✅ 200; cabeceras de seguridad presentes; sin `X-Powered-By`                                               |
| Mobile (Metro)                                | ✅ Bundles ios, android y web de `expo-router/entry` y de `@v19/api-client`, `@v19/supabase` e `@v19/i18n` |

---

## 6. Avisos conocidos y aceptados

| Aviso                                               | Motivo                                                                                                                   | Referencia                                                   |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `deprecated eslint@9.39.5` al resolver dependencias | `eslint-plugin-react` 7.37 y `eslint-plugin-import` 2.32 (dentro de las configs de Next y Expo) solo aceptan `eslint ^9` | [ADR 0005](../decisions/0005-eslint-9.md)                    |
| CSP no configurada                                  | Requiere nonces y los dominios reales (Supabase, Shopify CDN, analítica)                                                 | [ADR 0004](../decisions/0004-shopify-tokens-y-versionado.md) |

---

## 7. Pendientes operativos (no son defectos)

- **Commitear los cambios.** Hasta entonces `pnpm check:schemas` falla en local a propósito: los
  JSON Schema todavía no están versionados.
- **Primer run del CI en GitHub.** Confirmará las versiones de las actions (`checkout@v5`,
  `setup-node@v5`, `setup-uv@v7`).
- **Migración del catálogo a la Storefront API**, al comenzar la integración real de Shopify (ADR 0004).
- **Primer endpoint autenticado**: usar `CurrentUser` de `app/core/security.py`.

---

## 8. Riesgos técnicos a vigilar

- **Versiones muy recientes** (TS 6, RN 0.88, Next 16.4): menos ejemplos y librerías probadas.
  Añadir dependencias nativas siempre con `expo install`.
- **Enlazado aislado de pnpm con Expo**: hoy funciona en las 3 plataformas. Si una dependencia nativa
  lo requiere, usar `nodeLinker: hoisted` en `pnpm-workspace.yaml` (ADR 0003).
- **Versión de la API de Shopify**: revisarla cada trimestre (ADR 0004).
- **Paquetes como TS fuente**: compilarlos si algún día los consume Node sin bundler (ADR 0003).

---

## 9. Comandos

```bash
# Preparación
pnpm install
(cd apps/api && uv sync)
pnpm --filter @v19/supabase db:start        # requiere Docker
pnpm --filter @v19/supabase db:status       # claves locales para los .env
cp apps/web/.env.example    apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local
cp apps/api/.env.example    apps/api/.env

# Ejecutar
pnpm dev                                    # todo: web :3000, Metro :8081, API :8000
pnpm --filter @v19/web dev                  # Next.js
pnpm --filter @v19/web build && pnpm --filter @v19/web start
pnpm --filter @v19/mobile dev               # Expo (android / ios / web)
pnpm --filter @v19/api dev                  # FastAPI → /health, /docs

# Validar (lo mismo que el CI)
pnpm install --frozen-lockfile && pnpm peers check
pnpm format:check && pnpm check:schemas
pnpm lint && pnpm typecheck && pnpm build && pnpm test
pnpm --filter @v19/mobile exec expo export --platform all --output-dir dist

# Supabase
pnpm --filter @v19/supabase db:stop | db:reset | gen:types
```
