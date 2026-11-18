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

/**
 * Devuelve una función que obtiene el access token (JWT) de la sesión actual, o null.
 * Se pasa como `getToken` a `createApiClient` para que la API reciba `Authorization: Bearer`.
 */
export function supabaseTokenGetter(
  getClient: () => V19SupabaseClient,
): () => Promise<string | null> {
  return async () => {
    const { data } = await getClient().auth.getSession();
    return data.session?.access_token ?? null;
  };
}
