# V19 — instrucciones para Claude

Monorepo Turborepo + pnpm: `apps/web` (Next.js), `apps/mobile` (Expo), `apps/api` (FastAPI),
`packages/*` compartidos, `supabase/` (migraciones). Ver `README.md` para comandos.

## Reglas de arquitectura (obligatorias)

Lee y respeta `docs/architecture/principles.md` antes de proponer o escribir código. Resumen:

1. Next.js y Expo son apps independientes: nunca se importan entre sí; comparten solo vía `packages/`.
2. FastAPI complementa a Supabase: no reimplementes Auth, RLS ni CRUD trivial en la API.
3. Shopify es la fuente de verdad del comercio: nada de precios/stock/pedidos autoritativos en Supabase
   ni llamadas a Shopify desde web/mobile.
4. Supabase es la fuente de verdad de los datos propios de V19: cambios por migración, RLS siempre,
   regenerar tipos (`pnpm --filter @v19/supabase gen:types`).
5. Tipos y validaciones compartidas en `packages/` (`@v19/types`, `@v19/validators`); Pydantic alineado.
6. Ningún secreto en el cliente: solo `NEXT_PUBLIC_*`/`EXPO_PUBLIC_*` públicas; `service_role`,
   Shopify y OpenAI solo en `apps/api`.
7. Operaciones sensibles (secretos, dinero, stock, permisos, IA, datos de otros usuarios) solo en backend.
8. No dupliques lógica entre web y mobile: muévela a un paquete en el mismo cambio.

Si una tarea exige romper una regla, detente y señálalo; propone un ADR en `docs/decisions/`
en lugar de saltártela. Repasa el checklist del final de `principles.md` antes de dar algo por terminado.

Las instrucciones específicas de cada app están en `apps/web/AGENTS.md` y `apps/mobile/AGENTS.md`.
