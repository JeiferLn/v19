import { parsePublicEnv } from "@v19/env";

// Cada variable se lee con su nombre literal para que Expo la incruste en el bundle.
export const env = parsePublicEnv(
  {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
  "EXPO_PUBLIC_",
);
