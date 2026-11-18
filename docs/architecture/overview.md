# Arquitectura

```
apps/web (Next.js) ──┐                     ┌── Supabase (Auth + Postgres)
                     ├── @v19/api-client ──┤
apps/mobile (Expo) ──┘        │            └── apps/api (FastAPI) ── Shopify / OpenAI
                              │
        @v19/types · @v19/validators · @v19/i18n · @v19/supabase
```

- **web** y **mobile** comparten tipos, validaciones (zod), traducciones y clientes.
- **Supabase** gestiona autenticación y base de datos; los clientes usan la `anon key` + RLS.
- **api** (FastAPI) encapsula la lógica de servidor e integraciones con secretos (Shopify, OpenAI).
  Los clientes envían el JWT de Supabase en `Authorization: Bearer` (validación en la API: pendiente).
- Los paquetes `@v19/*` se consumen como TypeScript fuente (sin build): Next los transpila con
  `transpilePackages` y Metro los resuelve directamente.
- Los esquemas Pydantic de la API devuelven JSON en camelCase para coincidir con `@v19/types`.
