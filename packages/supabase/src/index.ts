import { createClient, type SupabaseClient, type SupportedStorage } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type { Database };
export type V19SupabaseClient = SupabaseClient<Database>;

export interface CreateSupabaseOptions {
  url: string;
  anonKey: string;
  /** Storage de sesión: localStorage en web (por defecto), AsyncStorage en mobile. */
  storage?: SupportedStorage;
  /** En React Native debe ser false. */
  detectSessionInUrl?: boolean;
}

export function createSupabaseClient({
  url,
  anonKey,
  storage,
  detectSessionInUrl = true,
}: CreateSupabaseOptions): V19SupabaseClient {
  return createClient<Database>(url, anonKey, {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl,
    },
  });
}
