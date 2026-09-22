import { createClient } from "npm:@supabase/supabase-js@2";

type Alerta = {
  id: number;
  aluno_id: string;
  tutor_id: string;
  local_campus: string;
  status: string;
  criado_em: string;
  notificacao_enviada_em: string | null;
};

type WebhookPayload = {
  type: "INSERT";
  table: string;
  schema: string;
  record: Alerta;
  old_record: null;
};

type Dispositivo = {
  expo_push_token: string;
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

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const serviceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        "Variáveis internas do Supabase ausentes",
      );
    }

    const payload =
      (await req.json()) as WebhookPayload;

    if (
      payload.type !== "INSERT" ||
      payload.table !== "alertas" ||
      !payload.record
    ) {
      return Response.json(
        {
          sucesso: true,
          ignorado: true,
          motivo: "Evento não corresponde a um novo alerta",
        },
      );
    }

    const alerta = payload.record;

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
    );

    /*
     * Busca novamente o alerta e verifica se a notificação
     * já foi enviada.
     */
    const { data: alertaAtual, error: erroAlerta } =
      await supabaseAdmin
        .from("alertas")
        .select(
          `
            id,
            aluno_id,
            tutor_id,
            local_campus,
            status,
            criado_em,
            notificacao_enviada_em
          `,
        )
        .eq("id", alerta.id)
        .single();

    if (erroAlerta || !alertaAtual) {
      throw new Error(
        erroAlerta?.message ||
          "Alerta não encontrado.",
      );
    }

    if (alertaAtual.notificacao_enviada_em) {
      return Response.json({
        sucesso: true,
        ignorado: true,
        motivo: "Notificação já enviada",
      });
    }

    /*
     * Busca os dados gerais do estudante.
     */
    const { data: estudante, error: erroEstudante } =
      await supabaseAdmin
        .from("usuarios")
        .select("id, nome, estado, campus, tipo")
        .eq("id", alertaAtual.aluno_id)
        .single();

    if (erroEstudante || !estudante) {
      throw new Error(
        erroEstudante?.message ||
          "Estudante não encontrado.",
      );
    }

    /*
     * Busca turno e turma.
     */
    const { data: dadosAluno, error: erroDadosAluno } =
      await supabaseAdmin
        .from("alunos")
        .select("curso, turno, turma")
        .eq("id", alertaAtual.aluno_id)
        .single();

    if (erroDadosAluno || !dadosAluno) {
      throw new Error(
        erroDadosAluno?.message ||
          "Dados do estudante não encontrados.",
      );
    }

    /*
     * Confirma que o destinatário ainda é tutor e pertence
     * ao mesmo estado e campus.
     */
    const { data: tutor, error: erroTutor } =
      await supabaseAdmin
        .from("usuarios")
        .select("id, nome, estado, campus, tipo")
        .eq("id", alertaAtual.tutor_id)
        .eq("tipo", "tutor")
        .single();

    if (erroTutor || !tutor) {
      throw new Error(
        erroTutor?.message ||
          "Tutor não encontrado.",
      );
    }

    if (
      estudante.estado !== tutor.estado ||
      estudante.campus !== tutor.campus
    ) {
      throw new Error(
        "O tutor não pertence ao mesmo estado e campus.",
      );
    }

    /*
     * Busca todos os dispositivos registrados pelo tutor.
     */
    const {
      data: dispositivos,
      error: erroDispositivos,
    } = await supabaseAdmin
      .from("dispositivos_push")
      .select("expo_push_token")
      .eq("usuario_id", alertaAtual.tutor_id);

    if (erroDispositivos) {
      throw new Error(erroDispositivos.message);
    }

    if (!dispositivos || dispositivos.length === 0) {
      return Response.json({
        sucesso: true,
        enviada: false,
        motivo:
          "O tutor não possui dispositivo registrado",
      });
    }

    const mensagens = (
      dispositivos as Dispositivo[]
    ).map((dispositivo) => ({
      to: dispositivo.expo_push_token,
      title: `Alerta de ${estudante.nome}`,
      body:
        `${estudante.nome}, da turma ${dadosAluno.turma} ` +
        `(${dadosAluno.turno}), está em ` +
        `"${alertaAtual.local_campus}" e solicitou ajuda.`,
      sound: "default",
      priority: "high",
      channelId: "tarefas",
      data: {
        rota: "/TelaChat",
        tipo: "alerta_estudante",
        alertaId: alertaAtual.id,
        alunoId: alertaAtual.aluno_id,
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

    const resultadoExpo =
      await respostaExpo.json();

    if (!respostaExpo.ok) {
      throw new Error(
        `Erro do Expo: ${JSON.stringify(resultadoExpo)}`,
      );
    }

    /*
     * Somente registra a data depois que o Expo aceita
     * o envio.
     */
    const { error: erroAtualizacao } =
      await supabaseAdmin
        .from("alertas")
        .update({
          notificacao_enviada_em:
            new Date().toISOString(),
        })
        .eq("id", alertaAtual.id)
        .is("notificacao_enviada_em", null);

    if (erroAtualizacao) {
      throw new Error(erroAtualizacao.message);
    }

    return Response.json({
      sucesso: true,
      enviada: true,
      alertaId: alertaAtual.id,
      tutor: tutor.nome,
      dispositivos: dispositivos.length,
      resultadoExpo,
    });
  } catch (erro) {
    console.error(erro);

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