import { supabase } from "./supabase";

export async function testarLogin() {
  const { data: login, error: erroLogin } =
    await supabase.auth.signInWithPassword({
      email: "professor@teste.com",
      password: "12345",
    });

  console.log("ERRO LOGIN:", erroLogin);
  console.log("USUARIO:", login.user);

  if (erroLogin || !login.user) {
    return;
  }

  // TESTE 1 - Verifica a sessão atual
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("SESSION:", session);
  console.log("USER:", session?.user);
  console.log("USER ID:", session?.user?.id);

  // TESTE 2 - Busca o usuário pelo ID
  const { data: usuarioPorId, error: erroUsuarioPorId } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", login.user.id)
    .maybeSingle();

  console.log("USUARIO PELO ID:", usuarioPorId);
  console.log("ERRO USUARIO PELO ID:", erroUsuarioPorId);
  console.log("TIPO DO USUARIO:", usuarioPorId?.tipo);

  // TESTE 3 - Busca o aluno
  const { data: aluno, error: erroAluno } = await supabase
    .from("alunos")
    .select("*")
    .eq("id", login.user.id)
    .maybeSingle();

  console.log("ALUNO:", aluno);
  console.log("ERRO ALUNO:", erroAluno);

  // TESTE 4 - Busca o professor
  const { data: professor, error: erroProfessor } = await supabase
    .from("professores")
    .select("*")
    .eq("id", login.user.id)
    .maybeSingle();

  console.log("PROFESSOR:", professor);
  console.log("ERRO PROFESSOR:", erroProfessor);

  // TESTE 5 - Busca o tutor
  const { data: tutor, error: erroTutor } = await supabase
    .from("tutores")
    .select("*")
    .eq("id", login.user.id)
    .maybeSingle();

  console.log("TUTOR:", tutor);
  console.log("ERRO TUTOR:", erroTutor);

  // TESTE - Tarefas
  const { data: tarefas, error: erroTarefas } = await supabase
    .from("tarefas")
    .select("*");

  console.log("TAREFAS:", tarefas);
  console.log("ERRO TAREFAS:", erroTarefas);
}