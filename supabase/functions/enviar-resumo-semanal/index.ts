import { createClient } from "npm:@supabase/supabase-js@2";

type Tarefa = {
  id: number;
  titulo: string;
  data: string;
  tipo: string;
  aluno_id: string;
};

type Dispositivo = {
  expo_push_token: string;
};

const obterDataBrasil = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
};

const criarDataUTC = (data: string) => {
  return new Date(`${data}T00:00:00.000Z`);
};

const formatarData = (data: Date) => {
  return data.toISOString().slice(0, 10);
};

const calcularSemana = (hojeTexto: string) => {
  const hoje = criarDataUTC(hojeTexto);
  const diaDaSemana = hoje.getUTCDay();

  // No JavaScript: domingo = 0 e segunda-feira = 1.
  const diasDesdeSegunda =
    diaDaSemana === 0 ? 6 : diaDaSemana - 1;

  const inicio = new Date(hoje);
  inicio.setUTCDate(inicio.getUTCDate() - diasDesdeSegunda);

  const fim = new Date(inicio);
  fim.setUTCDate(fim.getUTCDate() + 6);

  return {
    inicio: formatarData(inicio),
    fim: formatarData(fim),
  };
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY",
    );

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
    const semana = calcularSemana(hoje);

    const { data: tarefas, error: erroTarefas } =
      await supabaseAdmin
        .from("tarefas")
        .select("id, titulo, data, tipo, aluno_id")
        .eq("concluido", false)
        .gte("data", semana.inicio)
        .lte("data", semana.fim)
        .order("data", { ascending: true });

    if (erroTarefas) {
      throw new Error(erroTarefas.message);
    }

    const tarefasPorAluno = new Map<string, Tarefa[]>();

    for (const tarefa of (tarefas || []) as Tarefa[]) {
      const lista =
        tarefasPorAluno.get(tarefa.aluno_id) || [];

      lista.push(tarefa);
      tarefasPorAluno.set(tarefa.aluno_id, lista);
    }

    let enviadas = 0;
    let ignoradas = 0;
    const erros: string[] = [];

    for (const [alunoId, atividades] of tarefasPorAluno) {
      const { data: resumoExistente, error: erroConsulta } =
        await supabaseAdmin
          .from("resumos_semanais_enviados")
          .select("id")
          .eq("usuario_id", alunoId)
          .eq("semana_inicio", semana.inicio)
          .maybeSingle();

      if (erroConsulta) {
        erros.push(
          `Aluno ${alunoId}: ${erroConsulta.message}`,
        );
        continue;
      }

      if (resumoExistente) {
        ignoradas++;
        continue;
      }

      const { data: dispositivos, error: erroDispositivos } =
        await supabaseAdmin
          .from("dispositivos_push")
          .select("expo_push_token")
          .eq("usuario_id", alunoId);

      if (erroDispositivos) {
        erros.push(
          `Aluno ${alunoId}: ${erroDispositivos.message}`,
        );
        continue;
      }

      if (!dispositivos || dispositivos.length === 0) {
        ignoradas++;
        continue;
      }

      const quantidade = atividades.length;

      const textoQuantidade =
        quantidade === 1
          ? "1 atividade pendente"
          : `${quantidade} atividades pendentes`;

      const mensagens = (dispositivos as Dispositivo[]).map(
        (dispositivo) => ({
          to: dispositivo.expo_push_token,
          title: "Sua semana no PAED",
          body:
            `Veja suas tarefas ou reuniões da semana! ` +
            `Você possui ${textoQuantidade}.`,
          sound: "default",
          channelId: "tarefas",
          data: {
            rota: "/TelaTarefas",
            tipo: "resumo_semanal",
            semanaInicio: semana.inicio,
            semanaFim: semana.fim,
          },
        }),
      );

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
        erros.push(
          `Aluno ${alunoId}: ${JSON.stringify(resultadoExpo)}`,
        );
        continue;
      }

      const { error: erroRegistro } =
        await supabaseAdmin
          .from("resumos_semanais_enviados")
          .insert({
            usuario_id: alunoId,
            semana_inicio: semana.inicio,
            semana_fim: semana.fim,
          });

      if (erroRegistro) {
        erros.push(
          `Registro ${alunoId}: ${erroRegistro.message}`,
        );
        continue;
      }

      enviadas++;
    }

    return Response.json({
      sucesso: true,
      hoje,
      semanaInicio: semana.inicio,
      semanaFim: semana.fim,
      estudantesComAtividades: tarefasPorAluno.size,
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