# @v19/mobile

App móvil de V19: React Native + [Expo](https://expo.dev) (SDK 58) con
[Expo Router](https://docs.expo.dev/router/introduction) (rutas basadas en archivos).

## Puesta en marcha

Desde la raíz del monorepo (no uses `npm install` aquí: el workspace lo gestiona pnpm):

```bash
pnpm install
cp apps/mobile/.env.example apps/mobile/.env.local   # solo variables EXPO_PUBLIC_*
pnpm --filter @v19/mobile dev                         # Metro en :8081
```

Variantes: `pnpm --filter @v19/mobile android`, `... ios`, `... web`.

## Estructura

```
app/          Rutas de Expo Router: cada archivo es una pantalla; _layout.tsx define navegadores
src/          Código que no es ruta: components/, hooks/, services/, constants/, modules/
assets/       Imágenes, iconos y fuentes
```

Las rutas viven en `app/` (en la raíz de `apps/mobile`, **no** en `src/app/`). Todo lo que no sea una
pantalla va en `src/` y se importa con el alias `@/`.

## Comandos

| Comando                                               | Qué hace                             |
| ----------------------------------------------------- | ------------------------------------ |
| `pnpm --filter @v19/mobile lint`                      | ESLint (`expo lint`)                 |
| `pnpm --filter @v19/mobile typecheck`                 | `tsc --noEmit`                       |
| `pnpm --filter @v19/mobile exec expo install <pkg>`   | Añadir dependencia nativa compatible |
| `pnpm --filter @v19/mobile exec expo install --check` | Verificar versiones contra el SDK    |

## Variables de entorno

Solo variables `EXPO_PUBLIC_*` (se incrustan en el bundle y son públicas). Ningún secreto
(`SUPABASE_SERVICE_ROLE_KEY`, Shopify, OpenAI) puede ir aquí: esos viven en `apps/api/.env`.
Ver `docs/architecture/principles.md`.
