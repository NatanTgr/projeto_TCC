import { supabase } from "./supabase";

export async function testarSupabase() {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .limit(5);

  console.log("DADOS:", data);
  console.log("ERRO:", error);
}