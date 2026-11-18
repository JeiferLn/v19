import { createSupabaseClient, type V19SupabaseClient } from "@v19/supabase";

import { env } from "./env";

let client: V19SupabaseClient | null = null;

/** Cliente de Supabase para el navegador (singleton, creado bajo demanda). */
export function getSupabase(): V19SupabaseClient {
  client ??= createSupabaseClient({ url: env.supabaseUrl, anonKey: env.supabaseAnonKey });
  return client;
}
