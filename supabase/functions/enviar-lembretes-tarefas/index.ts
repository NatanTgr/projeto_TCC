import { createClient } from "npm:@supabase/supabase-js@2";

type Tarefa = {
  id: number;
  titulo: string;
  data: string;
  tipo: string;
  aluno_id: string;
  concluido: boolean;
};

type TipoLembrete =
  | "um_mes"
  | "duas_semanas"
  | "uma_semana"
  | "tres_dias"
  | "um_dia"
  | "atividade_hoje"
  | "atrasada";

const criarDataUTC = (data: string) => {
  return new Date(`${data}T00:00:00.000Z`);
};

const adicionarDias = (
  data: string,
  quantidade: number,
) => {
  const resultado = criarDataUTC(data);

  resultado.setUTCDate(
    resultado.getUTCDate() + quantidade,
  );

  return resultado.toISOString().slice(0, 10);
};

const adicionarUmMes = (data: string) => {
  const atual = criarDataUTC(data);

  const ano = atual.getUTCFullYear();
  const mes = atual.getUTCMonth();
  const dia = atual.getUTCDate();

  const ultimoDiaDoProximoMes = new Date(
    Date.UTC(ano, mes + 2, 0),
  ).getUTCDate();

  const resultado = new Date(
    Date.UTC(
      ano,
      mes + 1,
      Math.min(dia, ultimoDiaDoProximoMes),
    ),
  );

  return resultado.toISOString().slice(0, 10);
};

const obterDataBrasil = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
};

const descobrirLembrete = (
  dataTarefa: string,
  hoje: string,
): TipoLembrete | null => {
  if (dataTarefa === hoje) {
    return "atividade_hoje";
  }

  if (dataTarefa < hoje) {
    return "atrasada";
  }

  if (dataTarefa === adicionarDias(hoje, 1)) {
    return "um_dia";
  }

  if (dataTarefa === adicionarDias(hoje, 3)) {
    return "tres_dias";
  }

  if (dataTarefa === adicionarDias(hoje, 7)) {
    return "uma_semana";
  }

  if (dataTarefa === adicionarDias(hoje, 14)) {
    return "duas_semanas";
  }

  if (dataTarefa === adicionarUmMes(hoje)) {
    return "um_mes";
  }

  return null;
};

const criarMensagem = (
  tarefa: Tarefa,
  tipo: TipoLembrete,
) => {
  const nomeAtividade =
    tarefa.tipo?.toLocaleLowerCase("pt-BR") === "reunião"
      ? "reunião"
      : "tarefa";

  switch (tipo) {
    case "um_mes":
      return {
        title: "Lembrete de atividade",
        body: `Falta 1 mês para a ${nomeAtividade}: ${tarefa.titulo}`,
      };

    case "duas_semanas":
      return {
        title: "Lembrete de atividade",
        body: `Faltam 2 semanas para a ${nomeAtividade}: ${tarefa.titulo}`,
      };

    case "uma_semana":
      return {
        title: "Lembrete de atividade",
        body: `Falta 1 semana para a ${nomeAtividade}: ${tarefa.titulo}`,
      };

    case "tres_dias":
      return {
        title: "Atividade próxima",
        body: `Faltam 3 dias para a ${nomeAtividade}: ${tarefa.titulo}`,
      };

    case "um_dia":
      return {
        title: "Atividade amanhã",
        body: `A ${nomeAtividade} "${tarefa.titulo}" é amanhã!`,
      };
    case "atividade_hoje":
      return {
        title: tarefa.tipo === "Reunião" ? "Reunião de hoje" : "Tarefa de hoje",
        body: `A ${nomeAtividade} "${tarefa.titulo}" está marcada para hoje!`,
      };
    case "atrasada":
      return {
        title: "Atividade atrasada",
        body: `A ${nomeAtividade} "${tarefa.titulo}" está atrasada!`,
      };
  }
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

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
    );

    const hoje = obterDataBrasil();
    const limite = adicionarUmMes(hoje);

    const { data: tarefas, error: erroTarefas } =
      await supabaseAdmin
        .from("tarefas")
        .select(
          "id, titulo, data, tipo, aluno_id, concluido",
        )
        .eq("concluido", false)
        .lte("data", limite);

    if (erroTarefas) {
      throw new Error(erroTarefas.message);
    }

    let enviadas = 0;
    let ignoradas = 0;
    const erros: string[] = [];
    const preferenciasPorAluno = new Map<string, boolean>();

    for (const tarefa of (tarefas || []) as Tarefa[]) {
      let tarefasAtivas = preferenciasPorAluno.get(tarefa.aluno_id);

      if (tarefasAtivas === undefined) {
        const { data: preferencias, error: erroPreferencias } =
          await supabaseAdmin
            .from("preferencias_notificacoes")
            .select("tarefas_ativas")
            .eq("usuario_id", tarefa.aluno_id)
            .maybeSingle();

        if (erroPreferencias) {
          erros.push(`Aluno ${tarefa.aluno_id}: ${erroPreferencias.message}`);
          continue;
        }

        tarefasAtivas = preferencias?.tarefas_ativas ?? true;
        preferenciasPorAluno.set(tarefa.aluno_id, tarefasAtivas);
      }

      if (!tarefasAtivas) {
        ignoradas++;
        continue;
      }
      const tipoLembrete = descobrirLembrete(tarefa.data, hoje);

      if (!tipoLembrete) {
        ignoradas++;
        continue;
      }

      const { data: registroExistente } = await supabaseAdmin
        .from("notificacoes_enviadas")
        .select("id")
        .eq("tarefa_id", tarefa.id)
        .eq("usuario_id", tarefa.aluno_id)
        .eq("tipo", tipoLembrete)
        .eq("data_referencia", hoje)
        .maybeSingle();

      if (registroExistente) {
        ignoradas++;
        continue;
      }

      const { data: dispositivos, error: erroTokens } = await supabaseAdmin
        .from("dispositivos_push")
        .select("expo_push_token")
        .eq("usuario_id", tarefa.aluno_id);

      if (erroTokens) {
        erros.push(`Tarefa ${tarefa.id}: ${erroTokens.message}`);
        continue;
      }

      if (!dispositivos || dispositivos.length === 0) {
        ignoradas++;
        continue;
      }

      const conteudo = criarMensagem(tarefa, tipoLembrete);

      const mensagens = dispositivos.map((dispositivo) => ({
        to: dispositivo.expo_push_token,
        title: conteudo.title,
        body: conteudo.body,
        sound: "default",
        channelId: "tarefas",
        data: {
          rota: "/TelaTarefas",
          tarefaId: tarefa.id,
        },
      }));

      const respostaExpo = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mensagens),
      });

      const resultadoExpo = await respostaExpo.json();

      if (!respostaExpo.ok) {
        erros.push(`Tarefa ${tarefa.id}: ${JSON.stringify(resultadoExpo)}`);
        continue;
      }

      const { error: erroRegistro } = await supabaseAdmin
        .from("notificacoes_enviadas")
        .insert({
          tarefa_id: tarefa.id,
          usuario_id: tarefa.aluno_id,
          tipo: tipoLembrete,
          data_referencia: hoje,
        });

      if (erroRegistro) {
        erros.push(`Registro ${tarefa.id}: ${erroRegistro.message}`);
        continue;
      }

      enviadas++;
    }

    return Response.json({
      sucesso: true,
      hoje,
      tarefasAnalisadas: tarefas?.length || 0,
      enviadas,
      ignoradas,
      erros,
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