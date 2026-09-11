import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://atootrwwqibflkzjpkud.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0b290cnd3cWliZmxrempwa3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NjExOTIsImV4cCI6MjA5NDEzNzE5Mn0.CfQ5gMTFPe18PVakUV4OaHPfIxod6Mqp0UTg7BkXNsw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});