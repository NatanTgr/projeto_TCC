import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY no .env"
  );
}

const servidorWeb =
  Platform.OS === "web" && typeof window === "undefined";

export const supabase = createClient(url, key, {
  auth: {
    storage: servidorWeb ? undefined : AsyncStorage,
    autoRefreshToken: !servidorWeb,
    persistSession: !servidorWeb,
    detectSessionInUrl: false,
  },
});