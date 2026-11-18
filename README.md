# v19

Monorepo con **Turborepo** + **pnpm**: web (Next.js), mobile (Expo) y API (FastAPI), con Supabase.

## Estructura

```
apps/
  web/        Next.js (App Router, Tailwind)        → @v19/web
  mobile/     React Native + Expo Router            → @v19/mobile
  api/        Python + FastAPI (uv)                 → @v19/api
packages/
  types/      Tipos TS compartidos                  → @v19/types
  validators/ Esquemas zod                          → @v19/validators
  api-client/ Cliente HTTP tipado para web y mobile → @v19/api-client
  supabase/   Cliente y tipos de Supabase           → @v19/supabase
  i18n/       Traducciones (i18next, es/en)         → @v19/i18n
  config/     tsconfig y prettier compartidos       → @v19/config
supabase/     config.toml, migraciones y seed
docs/         arquitectura, API y decisiones (ADR)
```

## Requisitos

- Node.js ≥ 20 y pnpm (`corepack enable`)
- [uv](https://docs.astral.sh/uv/) para la API (instala Python 3.12 automáticamente)
- Opcional: [Supabase CLI](https://supabase.com/docs/guides/cli) + Docker para la BD local

## Puesta en marcha

```bash
pnpm install                                         # dependencias JS de todo el monorepo
(cd apps/api && uv sync)                             # entorno Python 3.12 de la API
cp apps/web/.env.example    apps/web/.env.local      # variables públicas de Next.js
cp apps/mobile/.env.example apps/mobile/.env.local   # variables públicas de Expo
cp apps/api/.env.example    apps/api/.env            # secretos server-side (solo la API)

pnpm dev                                             # web :3000, mobile (Metro) :8081, api :8000
```

O cada app por separado:

```bash
pnpm --filter @v19/web dev       # Next.js   → http://localhost:3000
pnpm --filter @v19/mobile dev    # Expo/Metro → http://localhost:8081
pnpm --filter @v19/api dev       # FastAPI   → http://localhost:8000/health
```

## Variables de entorno

No hay `.env` en la raíz: cada runtime lee el suyo desde su carpeta.

| Archivo                  | Lo lee                                         | Contiene                                                     |
| ------------------------ | ---------------------------------------------- | ------------------------------------------------------------ |
| `apps/web/.env.local`    | Next.js                                        | Solo `NEXT_PUBLIC_*` (públicas, van al bundle del navegador) |
| `apps/mobile/.env.local` | Expo                                           | Solo `EXPO_PUBLIC_*` (públicas, van al bundle de la app)     |
| `apps/api/.env`          | FastAPI (`app/core/config.py`, cwd `apps/api`) | Secretos: `SUPABASE_SERVICE_ROLE_KEY`, OpenAI, Shopify       |

`SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` y `SHOPIFY_*` solo existen en `apps/api/.env`; nunca
con prefijo `NEXT_PUBLIC_`/`EXPO_PUBLIC_`. Los `.env*` reales están en `.gitignore`; solo se versionan
los `.env.example`.

## Comandos

| Comando                                 | Qué hace                           |
| --------------------------------------- | ---------------------------------- |
| `pnpm dev`                              | Arranca todas las apps en paralelo |
| `pnpm build`                            | Build con caché de Turborepo       |
| `pnpm lint` / `pnpm typecheck`          | Lint y comprobación de tipos       |
| `pnpm test`                             | Tests (pytest en la API)           |
| `pnpm --filter @v19/web dev`            | Solo una app                       |
| `pnpm --filter @v19/mobile add <pkg>`   | Añadir dependencia a una app       |
| `pnpm --filter @v19/supabase gen:types` | Regenerar tipos desde la BD local  |
| `supabase start` / `supabase db reset`  | BD local con migraciones y seed    |

Para dependencias nativas en mobile usa `pnpm --filter @v19/mobile exec expo install <pkg>`.

Más detalle en [`docs/`](docs/architecture/overview.md). Reglas de arquitectura obligatorias:
[`docs/architecture/principles.md`](docs/architecture/principles.md).
