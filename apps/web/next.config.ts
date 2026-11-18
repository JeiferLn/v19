import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Los paquetes del monorepo se publican como TypeScript fuente: Next debe transpilarlos.
  transpilePackages: [
    "@v19/api-client",
    "@v19/i18n",
    "@v19/supabase",
    "@v19/types",
    "@v19/validators",
  ],
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
};

export default nextConfig;
