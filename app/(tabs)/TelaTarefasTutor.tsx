import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../bd/supabase";
import Estilos from "../../Estilos/TelaTarefasTutorEstilo";

type Aluno = {
  id: string;
  nome: string;
  turma: string;
  turno: string;
  tarefasPendentes: number;
};

export default function TelaTarefasTutor() {
  const { tema } = useTheme();
  const router = useRouter();

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunosFixados, setAlunosFixados] = useState<string[]>([]);

  const carregarAlunos = async () => {
    try {
      /*
       * Busca os alunos e seus dados da tabela usuarios.
       * Como todo tutor pode visualizar todos os alunos,
       * não precisamos filtrar por tutor.
       */
      const { data: alunosSalvos, error: erroAlunos } = await supabase
        .from("alunos")
        .select(`
          id,
          turma,
          turno,
          usuarios (
            nome
          )
        `);

      if (erroAlunos) {
        console.log("Erro ao carregar alunos:", erroAlunos);
        Alert.alert("Erro", "Não foi possível carregar os alunos.");
        return;
      }

      /*
       * Busca as tarefas para descobrir quantas estão
       * pendentes para cada aluno.
       */
      const { data: tarefas, error: erroTarefas } = await supabase
        .from("tarefas")
        .select("aluno_id, concluido");

      if (erroTarefas) {
        console.log("Erro ao carregar tarefas:", erroTarefas);
        Alert.alert("Erro", "Não foi possível carregar as tarefas.");
        return;
      }

      const listaAlunos: Aluno[] = (alunosSalvos || []).map((aluno: any) => {
        const tarefasPendentes = (tarefas || []).filter(
          (tarefa) =>
            tarefa.aluno_id === aluno.id &&
            tarefa.concluido === false
        ).length;

        return {
          id: aluno.id,
          nome: aluno.usuarios?.nome || "Aluno",
          turma: aluno.turma,
          turno: aluno.turno,
          tarefasPendentes,
        };
      });

      setAlunos(listaAlunos);
    } catch (error) {
      console.log("Erro ao carregar alunos:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarAlunos();
    }, [])
  );

  /*
   * Fixa ou desfixa um aluno.
   */
  const alternarFixado = (alunoId: string) => {
    setAlunosFixados((atual) => {
      if (atual.includes(alunoId)) {
        return atual.filter((id) => id !== alunoId);
      }

      return [...atual, alunoId];
    });
  };

  /*
   * Abre a TelaTarefas passando o ID do aluno selecionado.
   */
  const abrirTarefasAluno = (alunoId: string) => {
    router.push({
      pathname: "/TelaTarefas",
      params: {
        alunoId,
      },
    });
  };

  /*
   * Alunos fixados aparecem primeiro.
   */
  const alunosOrdenados = [...alunos].sort((a, b) => {
    const aFixado = alunosFixados.includes(a.id);
    const bFixado = alunosFixados.includes(b.id);

    if (aFixado && !bFixado) return -1;
    if (!aFixado && bFixado) return 1;

    return a.nome.localeCompare(b.nome);
  });

  return (
    <View
      style={[
        Estilos.container,
        { backgroundColor: tema.background },
      ]}
    >
      <Text
        style={[
          Estilos.titulo,
          { color: tema.text },
        ]}
      >
        Tarefas dos Alunos
      </Text>

      <ScrollView
        style={Estilos.lista}
        contentContainerStyle={Estilos.listaConteudo}
        showsVerticalScrollIndicator={false}
      >
        {alunosOrdenados.map((aluno) => (
          <TouchableOpacity
            key={aluno.id}
            style={[
              Estilos.cardAluno,
              {
                backgroundColor: tema.card,
              },
            ]}
            activeOpacity={0.8}
            onPress={() => abrirTarefasAluno(aluno.id)}
          >
            {/* Avatar */}
            <View style={Estilos.avatar}>
              <Text style={Estilos.avatarTexto}>
                {aluno.nome.charAt(0).toUpperCase()}
              </Text>
            </View>

            {/* Informações do aluno */}
            <View style={Estilos.informacoes}>
              <Text
                style={[
                  Estilos.nomeAluno,
                  { color: tema.text },
                ]}
                numberOfLines={1}
              >
                {aluno.nome}
              </Text>

              <View style={Estilos.linhaInformacoes}>
                <View style={Estilos.tagTurma}>
                  <Text style={Estilos.textoTag}>
                    {aluno.turma}
                  </Text>
                </View>

                <View style={Estilos.tagTurno}>
                  <Text style={Estilos.textoTagTurno}>
                    {aluno.turno}
                  </Text>
                </View>
              </View>

              <Text style={Estilos.tarefasPendentes}>
                {aluno.tarefasPendentes}{" "}
                {aluno.tarefasPendentes === 1
                  ? "tarefa pendente"
                  : "tarefas pendentes"}
              </Text>
            </View>

            {/* Botão de fixar */}
            <TouchableOpacity
              style={Estilos.botaoFixar}
              onPress={(event) => {
                event.stopPropagation();
                alternarFixado(aluno.id);
              }}
            >
              <Ionicons
                name={
                  alunosFixados.includes(aluno.id)
                    ? "pin"
                    : "pin-outline"
                }
                size={25}
                color={tema.text}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {alunos.length === 0 && (
          <View style={Estilos.semAlunos}>
            <Ionicons
              name="people-outline"
              size={45}
              color={tema.text}
            />

            <Text
              style={[
                Estilos.semAlunosTexto,
                { color: tema.text },
              ]}
            >
              Nenhum aluno encontrado.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}