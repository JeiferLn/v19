import { createSupabaseClient, type V19SupabaseClient } from "@v19/supabase";

let client: V19SupabaseClient | null = null;

/** Cliente de Supabase para el navegador (singleton, creado bajo demanda). */
export function getSupabase(): V19SupabaseClient {
  client ??= createSupabaseClient({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  });
  return client;
}
