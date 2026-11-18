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
  validators/ Esquemas zod (+ JSON Schema generado) → @v19/validators
  env/        Validación de variables públicas      → @v19/env
  api-client/ Cliente HTTP tipado para web y mobile → @v19/api-client
  supabase/   Cliente, tipos y CLI de Supabase      → @v19/supabase
  i18n/       Traducciones (i18next, es/en)         → @v19/i18n
  config/     tsconfig, eslint y prettier           → @v19/config
supabase/     config.toml, migraciones y seed
docs/         arquitectura, API y decisiones (ADR)
```

## Requisitos

- Node.js 24 (`.nvmrc`) y pnpm (`corepack enable`)
- [uv](https://docs.astral.sh/uv/) para la API (instala Python 3.12 automáticamente)
- Docker (Docker Desktop) para la base de datos local de Supabase. El CLI de Supabase se instala con
  `pnpm install` (devDependency de `@v19/supabase`); no hace falta instalarlo globalmente.

## Puesta en marcha

```bash
pnpm install                                         # dependencias JS (incluye el CLI de Supabase)
(cd apps/api && uv sync)                             # entorno Python 3.12 de la API
pnpm --filter @v19/supabase db:start                 # Supabase local (Docker): migraciones + seed
pnpm --filter @v19/supabase db:status                # muestra ANON_KEY y SERVICE_ROLE_KEY locales

cp apps/web/.env.example    apps/web/.env.local      # pega la ANON_KEY
cp apps/mobile/.env.example apps/mobile/.env.local   # pega la ANON_KEY
cp apps/api/.env.example    apps/api/.env            # pega la SERVICE_ROLE_KEY

pnpm dev                                             # web :3000, mobile (Metro) :8081, api :8000
```

O cada app por separado:

```bash
pnpm --filter @v19/web dev       # Next.js    → http://localhost:3000
pnpm --filter @v19/mobile dev    # Expo/Metro → http://localhost:8081
pnpm --filter @v19/api dev       # FastAPI    → http://localhost:8000/health · /docs
```

En Windows, cierra `pnpm dev` con **Ctrl+C** en su terminal. Si algún proceso queda vivo y ocupa un
puerto, libéralo desde PowerShell:

```powershell
3000, 8000, 8081 | % { Get-NetTCPConnection -LocalPort $_ -State Listen -EA 0 | % { Stop-Process -Id $_.OwningProcess -Force } }
```

## Variables de entorno

No hay `.env` en la raíz: cada runtime lee el suyo desde su carpeta.

| Archivo                  | Lo lee                         | Contiene                                                     |
| ------------------------ | ------------------------------ | ------------------------------------------------------------ |
| `apps/web/.env.local`    | Next.js                        | Solo `NEXT_PUBLIC_*` (públicas, van al bundle del navegador) |
| `apps/mobile/.env.local` | Expo                           | Solo `EXPO_PUBLIC_*` (públicas, van al bundle de la app)     |
| `apps/api/.env`          | FastAPI (`app/core/config.py`) | Secretos: `SUPABASE_SERVICE_ROLE_KEY`, OpenAI, Shopify       |

- `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` y `SHOPIFY_*` solo existen en `apps/api/.env`; nunca
  con prefijo `NEXT_PUBLIC_`/`EXPO_PUBLIC_`. Los `.env*` reales están en `.gitignore`; solo se
  versionan los `.env.example`.
- Web y mobile validan sus variables con `@v19/env` (zod) al usarlas por primera vez: si falta una o
  no es válida, el error nombra la variable exacta (p. ej. `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
- La API valida las suyas con `pydantic-settings` al arrancar.

## Comandos

| Comando                                                     | Qué hace                                                     |
| ----------------------------------------------------------- | ------------------------------------------------------------ |
| `pnpm dev`                                                  | Arranca todas las apps en paralelo                           |
| `pnpm build`                                                | Build con caché de Turborepo                                 |
| `pnpm lint` / `pnpm typecheck`                              | ESLint + ruff / tsc + mypy                                   |
| `pnpm test`                                                 | Vitest (paquetes) + pytest (API, JWT y contratos)            |
| `pnpm format` / `pnpm format:check`                         | Prettier en todo el repo                                     |
| `pnpm check:schemas`                                        | Regenera los JSON Schema desde zod y falla si hay diferencia |
| `pnpm --filter @v19/supabase db:start`                      | Supabase local (`db:stop`, `db:reset`, `db:status`)          |
| `pnpm --filter @v19/supabase gen:types`                     | Regenera `database.types.ts` desde la BD local               |
| `pnpm --filter @v19/validators gen:schemas`                 | Regenera `packages/validators/schemas/*.json`                |
| `pnpm --filter @v19/mobile exec expo export --platform all` | Bundle de producción de mobile (también en CI)               |

Para dependencias nativas en mobile usa `pnpm --filter @v19/mobile exec expo install <pkg>`.

## CI

`.github/workflows/ci.yml` ejecuta en cada push a `main` y en cada PR: install con lockfile congelado,
`peers check`, `format:check`, `check:schemas`, `lint`, `typecheck`, `build`, `test` y `expo export`.

Más detalle en [`docs/`](docs/architecture/overview.md). Reglas de arquitectura obligatorias:
[`docs/architecture/principles.md`](docs/architecture/principles.md).
