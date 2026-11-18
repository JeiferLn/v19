import type { NextConfig } from "next";

// Cabeceras de seguridad básicas para todas las rutas. La CSP queda pendiente (requiere nonces
// coordinados con los scripts de Next); ver docs/decisions/0004-shopify-tokens-y-versionado.md.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Los paquetes del monorepo se publican como TypeScript fuente: Next debe transpilarlos.
  transpilePackages: [
    "@v19/api-client",
    "@v19/env",
    "@v19/i18n",
    "@v19/supabase",
    "@v19/types",
    "@v19/validators",
  ],
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
