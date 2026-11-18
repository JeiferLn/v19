import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSupabaseClient, type V19SupabaseClient } from "@v19/supabase";

import { env } from "./env";

let client: V19SupabaseClient | null = null;

/** Cliente de Supabase (singleton, creado bajo demanda con sesión persistida en AsyncStorage). */
export function getSupabase(): V19SupabaseClient {
  client ??= createSupabaseClient({
    url: env.supabaseUrl,
    anonKey: env.supabaseAnonKey,
    storage: AsyncStorage,
    detectSessionInUrl: false,
  });
  return client;
}
