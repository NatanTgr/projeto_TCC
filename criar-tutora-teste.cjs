
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const senha = process.env.PAED_TEST_PASSWORD;

if (!supabaseUrl || !serviceRole || !senha) {
  console.error("Faltam variáveis de ambiente.");
  process.exit(1);
}

const supabase = createClient(
  supabaseUrl,
  serviceRole,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function criarTutora() {
  const email = "professor@teste.com";

  const { data, error } =
    await supabase.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,

      user_metadata: {
        full_name: "Juliana Almeida Santos",
        role: "professor",
        campus: "IFPR - Pinhais",
        estado: "PR",
        departamento: "Apoio Pedagógico",
      },
    });

  if (error) {
    console.error("Erro ao criar tutora:", error.message);
    return;
  }

  console.log("Professora criada com sucesso!");
  console.log("Nome: Juliana Almeida Santos");
  console.log("E-mail:", email);
  console.log("UUID:", data.user.id);
}

criarTutora().catch(console.error);
