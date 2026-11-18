import { createApiClient } from '@v19/api-client';

import { supabase } from './supabase';

export const api = createApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000',
  getToken: async () => (await supabase.auth.getSession()).data.session?.access_token ?? null,
});
