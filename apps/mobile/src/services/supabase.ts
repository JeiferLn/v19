import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSupabaseClient } from '@v19/supabase';

export const supabase = createSupabaseClient({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  storage: AsyncStorage,
  detectSessionInUrl: false,
});
