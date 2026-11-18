# Arquitectura

> Las reglas obligatorias están en [`principles.md`](principles.md). Este documento describe la forma
> actual del sistema; si algo aquí contradice las reglas, mandan las reglas.

```
apps/web (Next.js) ──┐                       ┌── Supabase (Auth + Postgres + RLS)
                     │                       │     fuente de verdad: datos propios de V19
                     ├── @v19/supabase ──────┘                ▲
                     │                                        │ service role
                     ├── @v19/api-client ── apps/api (FastAPI)┤
apps/mobile (Expo) ──┘                                        ├── Shopify  (fuente de verdad: comercio)
                                                              └── OpenAI
        @v19/types · @v19/validators · @v19/i18n · @v19/config
```

## Fuentes de verdad

| Dominio                                                     | Fuente de verdad  | Acceso desde clientes                                  |
| ----------------------------------------------------------- | ----------------- | ------------------------------------------------------ |
| Catálogo, precios, stock, carrito, checkout, pedidos, pagos | **Shopify**       | Solo vía `apps/api`                                    |
| Usuarios, sesiones, autenticación                           | **Supabase Auth** | Directo con `anon key`                                 |
| Datos propios de V19 (perfiles, preferencias, contenido…)   | **Supabase DB**   | Directo con `anon key` + RLS, o vía API si es sensible |

## Responsabilidades

- **web** y **mobile** son apps independientes; comparten tipos, validaciones (zod), traducciones y
  clientes a través de `packages/`, nunca importándose entre sí.
- **Supabase** gestiona autenticación y base de datos; los clientes usan la `anon key` + RLS.
- **api** (FastAPI) complementa a Supabase: encapsula integraciones con secretos (Shopify, OpenAI),
  webhooks y operaciones sensibles. Es la única pieza con `service_role key` y tokens de terceros.
  Los clientes envían el JWT de Supabase en `Authorization: Bearer` (validación en la API: pendiente).
- Los paquetes `@v19/*` se consumen como TypeScript fuente (sin build): Next los transpila con
  `transpilePackages` y Metro los resuelve directamente. Ver
  [ADR 0003](../decisions/0003-paquetes-typescript-fuente.md).
- Los esquemas Pydantic de la API devuelven JSON en camelCase para coincidir con `@v19/types`.

## Capas de `apps/api`

```
app/api/routes/     HTTP: entrada/salida, auth, sin lógica de negocio
app/services/       Lógica de negocio y orquestación
app/integrations/   Clientes de terceros (shopify/, openai/) — únicos que conocen sus secretos
app/schemas/        Contratos Pydantic (alineados con @v19/types)
app/core/config.py  Settings desde variables de entorno
```

## Variables de entorno

Cada app lee su propio archivo (no hay `.env` raíz): `apps/web/.env.local` (solo `NEXT_PUBLIC_*`),
`apps/mobile/.env.local` (solo `EXPO_PUBLIC_*`) y `apps/api/.env` (secretos: service role, OpenAI,
Shopify). Detalle en el [README](../../README.md#variables-de-entorno).
