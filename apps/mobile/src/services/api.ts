import { createApiClient } from "@v19/api-client";
import { supabaseTokenGetter } from "@v19/supabase";

import { env } from "./env";
import { getSupabase } from "./supabase";

export const api = createApiClient({
  baseUrl: env.apiUrl,
  getToken: supabaseTokenGetter(getSupabase),
});
