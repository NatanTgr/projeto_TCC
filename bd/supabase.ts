import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

console.log("SUPABASE URL:", supabaseUrl);
console.log(
  "SUPABASE KEY:",
  supabasePublishableKey ? "CARREGADA" : "NÃO CARREGADA"
);

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);