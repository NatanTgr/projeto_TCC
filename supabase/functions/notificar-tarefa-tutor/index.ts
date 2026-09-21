import { createClient } from "npm:@supabase/supabase-js@2";

type Tarefa = {
  id: number;
  titulo: string;
  aluno_id: string;
  criado_por: string | null;
};

type WebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: Tarefa;
  old_record: Tarefa | null;
};

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return Response.json(
        { erro: "Método não permitido" },
        { status: 405 },
      );
    }

    const segredoRecebido =
      req.headers.get("x-webhook-secret");

    const segredoCorreto =
      Deno.env.get("WEBHOOK_SECRET");

    if (
      !segredoCorreto ||
      segredoRecebido !== segredoCorreto
    ) {
      return Response.json(
        { erro: "Não autorizado" },
        { status: 401 },
      );
    }

    const payload: WebhookPayload = await req.json();

    if (
      payload.type !== "INSERT" ||
      payload.table !== "tarefas"
    ) {
      return Response.json({
        ignorado: true,
        motivo: "Evento não é INSERT em tarefas",
      });
    }

    const tarefa = payload.record;

    if (!tarefa.criado_por) {
      return Response.json({
        ignorado: true,
        motivo: "Tarefa sem criado_por",
      });
    }

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const serviceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        "Variáveis internas do Supabase não encontradas",
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
    );

    const { data: criador, error: erroCriador } =
      await supabaseAdmin
        .from("usuarios")
        .select("id, nome, tipo")
        .eq("id", tarefa.criado_por)
        .single();

    if (erroCriador) {
      throw new Error(
        `Erro ao buscar criador: ${erroCriador.message}`,
      );
    }

    if (criador.tipo !== "tutor") {
      return Response.json({
        ignorado: true,
        motivo: "A tarefa não foi criada por um tutor",
      });
    }

    const { data: dispositivos, error: erroDispositivos } =
      await supabaseAdmin
        .from("dispositivos_push")
        .select("expo_push_token")
        .eq("usuario_id", tarefa.aluno_id);

    if (erroDispositivos) {
      throw new Error(
        `Erro ao buscar tokens: ${erroDispositivos.message}`,
      );
    }

    if (!dispositivos || dispositivos.length === 0) {
      return Response.json({
        ignorado: true,
        motivo: "O estudante não possui token registrado",
      });
    }

    const mensagens = dispositivos.map((dispositivo) => ({
      to: dispositivo.expo_push_token,
      title: "Nova atividade",
      body: `Tarefa adicionada pelo tutor ${criador.nome}!`,
      sound: "default",
      channelId: "tarefas",
      data: {
        rota: "/TelaTarefas",
        tarefaId: tarefa.id,
      },
    }));

    const respostaExpo = await fetch(
      "https://exp.host/--/api/v2/push/send",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mensagens),
      },
    );

    const resultadoExpo = await respostaExpo.json();

    if (!respostaExpo.ok) {
      throw new Error(
        `Erro do Expo: ${JSON.stringify(resultadoExpo)}`,
      );
    }

    return Response.json({
      sucesso: true,
      tarefa: tarefa.id,
      tutor: criador.nome,
      notificacoes: dispositivos.length,
      resultadoExpo,
    });
  } catch (erro) {
    console.error("Erro na função:", erro);

    const mensagem =
      erro instanceof Error
        ? erro.message
        : "Erro desconhecido";

    return Response.json(
      { erro: mensagem },
      { status: 500 },
    );
  }
});