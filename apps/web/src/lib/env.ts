import { parsePublicEnv } from "@v19/env";

// Cada variable se lee con su nombre literal para que Next la incruste en el bundle del cliente.
export const env = parsePublicEnv(
  {
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  "NEXT_PUBLIC_",
);
