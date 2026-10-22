
const { createClient } = require("@supabase/supabase-js");
const { randomBytes } = require("node:crypto");

const url = process.env.SUPABASE_URL;
const chaveAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !chaveAdmin) {
  console.error("Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, chaveAdmin, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const usuarios = [
  {
    nome: "Helena Martins Ribeiro",
    email: "helena.ribeiro@example.com",
    departamento: "Atendimento Educacional Especializado",
  },
  {
    nome: "Rafael Costa Almeida",
    email: "rafael.almeida@example.com",
    departamento: "Apoio Pedagógico",
  },
  {
    nome: "Camila Ferreira Lopes",
    email: "camila.lopes@example.com",
    departamento: "Acessibilidade e Inclusão",
  },
];

async function criarUsuarios() {
  for (const usuario of usuarios) {
    const senha = randomBytes(24).toString("base64url") + "Aa1!";

    const { data, error } = await supabase.auth.admin.createUser({
      email: usuario.email,
      password: senha,
      email_confirm: true,
      user_metadata: {
        full_name: usuario.nome,
        role: "napne",
        campus: "Pinhais",
        estado: "Paraná",
        departamento: usuario.departamento,
      },
    });

    if (error) {
      console.error(`Erro ao criar ${usuario.nome}:`, error.message);
      continue;
    }

    console.log(`Usuário criado: ${usuario.nome}`);
    console.log(`ID: ${data.user.id}`);
    console.log(`E-mail: ${usuario.email}`);
    console.log(`Senha temporária: ${senha}`);
    console.log("-----------------------------");
  }
}

criarUsuarios().catch(console.error);
