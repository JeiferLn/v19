# ADR 0004 — Shopify: tokens, versionado de la API y cabeceras de seguridad pendientes

- **Estado:** aceptado
- **Fecha:** 2026-11-18

## Contexto

La auditoría detectó que `apps/api` leía el catálogo con un token de la **Admin API** y fijaba
`SHOPIFY_API_VERSION=2025-01`. Según la documentación de versionado de Shopify, cada versión estable
se soporta un mínimo de 12 meses; a noviembre de 2026 las versiones soportadas son 2026-01, 2026-04,
2026-07 y 2026-10 (última estable). Una petición a una versión retirada "cae" a la versión soportada
más antigua, lo que puede cambiar el comportamiento sin aviso.

## Decisión

1. **Versión**: `SHOPIFY_API_VERSION` por defecto `2026-10`. `Settings` valida el formato
   (`AAAA-01|04|07|10`). Se revisa **cada trimestre** al publicar Shopify una nueva versión estable,
   y nunca se deja una versión a menos de 3 meses de su retirada.
2. **Tokens** (se aplica al empezar la integración real; el cliente actual no se reescribe ahora):
   - **Catálogo público** (productos, colecciones, precios de venta): **Storefront API** con token de
     Storefront (permisos de solo lectura públicos), llamado desde `apps/api`.
   - **Operaciones de backend** (pedidos, inventario, webhooks): **Admin API** con una app personalizada
     con los **scopes mínimos** necesarios. Su token vive solo en `apps/api/.env`.
   - Ningún token de Shopify llega a web/mobile (regla R3/R6).
3. **CSP en Next.js**: se añadieron cabeceras básicas (`X-Content-Type-Options`, `X-Frame-Options`,
   `Referrer-Policy`, `Permissions-Policy`) y se desactivó `X-Powered-By`. La Content-Security-Policy
   queda pendiente hasta que existan dominios reales (Supabase, Shopify CDN, analítica), porque exige
   nonces coordinados con los scripts de Next y una lista de orígenes que todavía no conocemos.

## Consecuencias

- El cliente actual (`app/integrations/shopify/client.py`) usa `priceRangeV2` de la Admin API; al
  migrar el catálogo a Storefront API se sustituirá por la consulta equivalente (`priceRange`).
- La versión de Shopify es configuración, no código: actualizarla es cambiar `.env`/default y
  ejecutar los tests de integración cuando existan.
