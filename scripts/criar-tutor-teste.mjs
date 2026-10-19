import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.PAED_SUPABASE_URL,
  process.env.PAED_SUPABASE_SECRET_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const { data, error } = await supabase.auth.admin.createUser({
  email: process.env.PAED_TUTOR_EMAIL,
  password: process.env.PAED_TUTOR_PASSWORD,
  email_confirm: true,

  user_metadata: {
    full_name: "Tutora Teste PAED",
    role: "tutor",
    estado: process.env.PAED_ESTADO,
    campus: process.env.PAED_CAMPUS,
    departamento: "NAPNE - Teste",
  },
});

if (error) {
  console.error("Erro ao criar tutora de teste:", error.message);
  process.exitCode = 1;
} else {
  console.log("Conta criada com sucesso!");
  console.log("ID:", data.user.id);
  console.log("Email:", data.user.email);
}