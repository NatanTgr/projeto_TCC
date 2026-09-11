import { supabase } from "./supabase";

export async function testarLogin() {
  const { data: login, error: erroLogin } =
    await supabase.auth.signInWithPassword({
      email: "teste@teste.com",
      password: "12345",
    });

  console.log("ERRO LOGIN:", erroLogin);
  console.log("USUARIO:", login.user);

  if (erroLogin || !login.user) {
    return;
  }
}