# Reglas de arquitectura

Estas reglas son **obligatorias** para cualquier cambio en el monorepo, lo haga una persona o un
agente (Claude, Copilot, etc.). Si un cambio necesita romper una regla, primero se propone y se
acepta un ADR en [`docs/decisions/`](../decisions/) que la modifique; nunca se rompe en silencio.

Decisión de origen: [ADR 0002](../decisions/0002-architecture-principles.md).

| #   | Regla                                                             |
| --- | ----------------------------------------------------------------- |
| R1  | Next.js y Expo son aplicaciones independientes                    |
| R2  | FastAPI es el backend complementario, no un reemplazo de Supabase |
| R3  | Shopify es la fuente de verdad del comercio                       |
| R4  | Supabase es la fuente de verdad de los datos propios de V19       |
| R5  | Los tipos y validaciones compartidas viven en `packages/`         |
| R6  | Las credenciales privadas nunca se exponen al cliente             |
| R7  | Las operaciones sensibles pasan por servicios backend             |
| R8  | No duplicar lógica entre web y mobile                             |

---

## R1 — Next.js y Expo son aplicaciones independientes

`apps/web` y `apps/mobile` se construyen, despliegan y versionan por separado. Comparten código
**solo** a través de paquetes `@v19/*`.

- ✅ Cada app tiene su propio `package.json`, routing, UI y ciclo de release (Vercel / EAS).
- ✅ Lo común se extrae a `packages/` (ver R5 y R8).
- ❌ Importar desde otra app: `import … from "../../web/src/…"` o `@v19/web` dentro de mobile (y viceversa).
- ❌ Asumir que una app existe para que la otra funcione (p. ej. que mobile llame a rutas `/api` de Next).
- ❌ Compartir componentes de UI directamente: React DOM y React Native tienen primitivas distintas.
  Si algún día se comparte UI, será en un paquete dedicado y mediante ADR.

## R2 — FastAPI es el backend complementario, no un reemplazo de Supabase

Supabase cubre lo que hace bien: **Auth, Postgres con RLS, Storage, Realtime**. `apps/api` existe
para lo que Supabase no debe hacer desde el cliente: integraciones con secretos (Shopify, OpenAI),
orquestación entre sistemas, webhooks, trabajos pesados y reglas de negocio sensibles.

- ✅ Los clientes leen/escriben datos propios simples directamente en Supabase con la `anon key` + RLS.
- ✅ La API valida el JWT de Supabase (`Authorization: Bearer`) para identificar al usuario.
- ✅ La API usa Supabase como su base de datos (no tiene otra BD propia).
- ❌ Reimplementar en FastAPI autenticación, sesiones o gestión de usuarios.
- ❌ Crear una base de datos paralela en la API o proxys CRUD triviales que solo reenvían a Supabase
  sin aportar lógica.
- ❌ Desactivar RLS "porque ya valida la API": RLS sigue siendo la primera línea de defensa.

## R3 — Shopify es la fuente de verdad del comercio

Catálogo, precios, inventario, variantes, carritos, checkout, pedidos, pagos, descuentos y clientes
de tienda **viven en Shopify**.

- ✅ Se consultan a través de `apps/api` (`app/integrations/shopify/`) y se exponen normalizados.
- ✅ Supabase puede guardar **referencias** (`shopify_product_id`, `shopify_order_id`, …) y datos
  propios asociados (favoritos, reseñas, notas).
- ✅ Una caché o réplica de lectura está permitida si es explícitamente derivada, se reconstruye
  desde Shopify (webhooks/sync) y nunca se edita a mano.
- ❌ Guardar en Supabase precios, stock o estado de pedidos como dato editable/autoritativo.
- ❌ Calcular totales, impuestos o descuentos en el cliente como valor final: el que vale es el de Shopify.
- ❌ Llamar a la Admin API de Shopify desde web o mobile.

## R4 — Supabase es la fuente de verdad de los datos propios de V19

Todo dato que no sea comercio y que genere V19 (perfiles, preferencias, contenido propio, historial
de la app, resultados de IA que se persistan, etc.) vive en Supabase Postgres.

- ✅ Cada cambio de esquema es una migración en `supabase/migrations/`; nunca cambios manuales en el dashboard.
- ✅ Toda tabla en `public` tiene **RLS activado** y políticas explícitas.
- ✅ Tras cada migración se regeneran los tipos: `pnpm --filter @v19/supabase gen:types`.
- ❌ Guardar datos propios en Shopify (metafields) como almacenamiento principal, en `localStorage`/
  `AsyncStorage` como fuente autoritativa, o en ficheros de la API.

## R5 — Los tipos y validaciones compartidas viven en `packages/`

| Qué                                    | Dónde             |
| -------------------------------------- | ----------------- |
| Tipos de dominio y contratos de la API | `@v19/types`      |
| Esquemas zod (entrada/salida)          | `@v19/validators` |
| Cliente HTTP tipado de `apps/api`      | `@v19/api-client` |
| Cliente y tipos de BD de Supabase      | `@v19/supabase`   |
| Textos y traducciones                  | `@v19/i18n`       |
| tsconfig / prettier                    | `@v19/config`     |

- ✅ Si un tipo o esquema lo usa más de una app, va a `packages/`.
- ✅ Las respuestas de la API se validan con zod en `@v19/api-client`.
- ✅ Los esquemas Pydantic de `apps/api/app/schemas/` se mantienen alineados con `@v19/types`
  (JSON en camelCase). Cambiar uno implica cambiar el otro en el mismo PR.
- ❌ Redefinir en una app un tipo que ya existe en `@v19/types` (p. ej. `interface Product` local).
- ❌ Editar a mano `packages/supabase/src/database.types.ts` (es generado).

## R6 — Las credenciales privadas nunca se exponen al cliente

Solo puede llegar al navegador o al binario móvil lo que es público por diseño:
URL de Supabase, `anon key` y URL de la API.

| Variable                                       | Dónde puede usarse     |
| ---------------------------------------------- | ---------------------- |
| `NEXT_PUBLIC_*`, `EXPO_PUBLIC_*`               | Cliente (son públicas) |
| `SUPABASE_SERVICE_ROLE_KEY`                    | Solo `apps/api`        |
| `SHOPIFY_ACCESS_TOKEN`, `SHOPIFY_STORE_DOMAIN` | Solo `apps/api`        |
| `OPENAI_API_KEY`                               | Solo `apps/api`        |

- ❌ Poner un secreto en una variable `NEXT_PUBLIC_*` / `EXPO_PUBLIC_*`, en `app.json`, en código
  fuente o en un paquete `@v19/*` (todos se empaquetan en clientes).
- ❌ Usar la `service_role key` en web o mobile, aunque sea en un Server Component de Next.
  Si Next necesita lógica privilegiada, se hace en `apps/api`.
- ❌ Commitear `.env`. Las nuevas variables se documentan en `.env.example` sin valor.
- ⚠️ Todo lo que vaya en un binario de Expo es extraíble: trata mobile como un cliente público.

## R7 — Las operaciones sensibles pasan por servicios backend

Es sensible cualquier operación que: use un secreto, mueva dinero o stock, cambie permisos/roles,
afecte a datos de otro usuario, consuma recursos de pago (IA) o deba ser auditable.

- ✅ Se implementan en `apps/api` (`routes/` → `services/` → `integrations/`) o, si son puramente de
  datos, en Postgres (funciones `security definer`, triggers) protegidas por RLS.
- ✅ El backend valida siempre la entrada y la identidad (JWT de Supabase), aunque el cliente ya haya validado.
- ✅ Webhooks (Shopify, pagos) se reciben y verifican (firma HMAC) en `apps/api`.
- ❌ Confiar en el cliente para precios, permisos, cuotas o estado de un pedido.
- ❌ Llamar a OpenAI, Shopify Admin u otra API con secreto directamente desde web o mobile.

## R8 — No duplicar lógica entre web y mobile

Las apps son independientes (R1), pero la lógica no se copia: se comparte.

- ✅ Reglas de negocio, formateo, cálculos de presentación, validaciones, llamadas a la API,
  acceso a Supabase y textos → `packages/` (o `apps/api` si es lógica de servidor).
- ✅ Lo específico de cada plataforma (UI, navegación, almacenamiento de sesión, permisos del
  dispositivo) se queda en su app, como adaptador fino sobre el paquete compartido.
- ❌ Copiar una función de `apps/web` a `apps/mobile` (o al revés). Si hace falta en las dos, se mueve
  a un paquete en ese mismo PR.
- ❌ Hacer `fetch` a la API a mano en una app: se usa `@v19/api-client`.
- ❌ Strings de UI hardcodeados en una app: van en `@v19/i18n`.

---

## Checklist para cada PR

- [ ] No hay imports entre `apps/web` y `apps/mobile` (R1).
- [ ] No se reimplementa nada que ya da Supabase (Auth, RLS, Storage) en la API (R2).
- [ ] Ningún dato de comercio se guarda como autoritativo fuera de Shopify (R3).
- [ ] Cambios de esquema = migración + RLS + tipos regenerados (R4).
- [ ] Tipos/esquemas usados por más de una app están en `packages/`; Pydantic alineado (R5).
- [ ] Ningún secreto en variables públicas, código cliente ni paquetes `@v19/*` (R6).
- [ ] Toda operación sensible se ejecuta y valida en backend (R7).
- [ ] No hay lógica copiada entre web y mobile (R8).
