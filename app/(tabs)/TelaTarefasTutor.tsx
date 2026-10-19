import { useCallback, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useFontSize } from "../../context/FontSizeContext";
import { supabase } from "../../lib/supabase";
import BotaoAlerta from "../../components/BotaoAlerta";
import AvatarImagem from "../../components/AvatarImagem";
import { buscarAvatar } from "../../components/avatares";
import { colors } from "../../style";
import Estilos from "../../Estilos/TelaTarefasTutorEstilo";

type Aluno = {
  id: string;
  nome: string;
  turma: string;
  turno: string;
  avatar: string | null;
  tarefasPendentes: number;
  fixado: boolean;
};

export default function TelaTarefasTutor() {
  const { tema } = useTheme();
  const { escalaFonte } = useFontSize();
  const router = useRouter();

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [idsSelecionados, setIdsSelecionados] = useState<string[]>([]);
  const [modalFiltroVisivel, setModalFiltroVisivel] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const carregarAlunos = async () => {
    try {
      setCarregando(true);

      const {
        data: { user },
        error: erroAuth,
      } = await supabase.auth.getUser();

      if (erroAuth || !user) {
        Alert.alert("Erro", "Nenhum usuário está logado.");
        return;
      }

      const { data: alunosSalvos, error: erroAlunos } = await supabase
        .from("alunos")
        .select(`
          id,
          turma,
          turno,
          usuarios (
            nome,
            avatar
          )
        `);

      if (erroAlunos) {
        console.log("Erro ao carregar alunos:", erroAlunos);
        Alert.alert("Erro", "Não foi possível carregar os alunos.");
        return;
      }

      const { data: tarefas, error: erroTarefas } = await supabase
        .from("tarefas")
        .select("aluno_id, concluido");

      if (erroTarefas) {
        console.log("Erro ao carregar tarefas:", erroTarefas);
        Alert.alert("Erro", "Não foi possível carregar as tarefas.");
        return;
      }

      const { data: fixados, error: erroFixados } = await supabase
        .from("usuarios_fixados")
        .select("usuario_fixado_id")
        .eq("usuario_id", user.id);

      if (erroFixados) {
        console.log("Erro ao carregar alunos fixados:", erroFixados);
      }

      const idsFixados = new Set(
        (fixados || []).map((item) => item.usuario_fixado_id)
      );

      const pendentesPorAluno = new Map<string, number>();

      (tarefas || []).forEach((tarefa) => {
        if (tarefa.concluido === false) {
          pendentesPorAluno.set(
            tarefa.aluno_id,
            (pendentesPorAluno.get(tarefa.aluno_id) || 0) + 1
          );
        }
      });

      const listaAlunos: Aluno[] = (alunosSalvos || []).map((aluno: any) => ({
        id: aluno.id,
        nome: aluno.usuarios?.nome || "Aluno",
        turma: aluno.turma,
        turno: aluno.turno,
        avatar: aluno.usuarios?.avatar || null,
        tarefasPendentes: pendentesPorAluno.get(aluno.id) || 0,
        fixado: idsFixados.has(aluno.id),
      }));

      setAlunos(listaAlunos);

      // Mantém as escolhas do filtro ao voltar para esta tela.
      // Alunos novos começam selecionados, como acontece na TelaChat.
      const idsAnteriores = idsAlunosConhecidosRef.current;
      const idsAtuais = new Set(listaAlunos.map((aluno) => aluno.id));

      setIdsSelecionados((selecionadosAtuais) => {
        const selecoesMantidas = selecionadosAtuais.filter((id) =>
          idsAtuais.has(id),
        );

        const novosAlunos = listaAlunos
          .filter((aluno) => !idsAnteriores.has(aluno.id))
          .map((aluno) => aluno.id);

        return [...new Set([...selecoesMantidas, ...novosAlunos])];
      });

      idsAlunosConhecidosRef.current = idsAtuais;
    } catch (error) {
      console.log("Erro ao carregar alunos:", error);
      Alert.alert("Erro", "Não foi possível carregar os alunos.");
    } finally {
      setCarregando(false);
    }
  };

  const idsAlunosConhecidosRef = useRef<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      carregarAlunos();
    }, [])
  );

  const alternarFixado = async (aluno: Aluno) => {
    try {
      const {
        data: { user },
        error: erroAuth,
      } = await supabase.auth.getUser();

      if (erroAuth || !user) {
        Alert.alert("Erro", "Nenhum usuário está logado.");
        return;
      }

      if (aluno.fixado) {
        const { error } = await supabase
          .from("usuarios_fixados")
          .delete()
          .eq("usuario_id", user.id)
          .eq("usuario_fixado_id", aluno.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("usuarios_fixados")
          .insert({
            usuario_id: user.id,
            usuario_fixado_id: aluno.id,
          });

        if (error) throw error;
      }

      setAlunos((atuais) =>
        atuais.map((item) =>
          item.id === aluno.id
            ? { ...item, fixado: !aluno.fixado }
            : item
        )
      );
    } catch (error) {
      console.log("Erro ao alterar aluno fixado:", error);
      Alert.alert("Erro", "Não foi possível alterar o aluno fixado.");
    }
  };

  const alternarSelecaoFiltro = (alunoId: string) => {
    setIdsSelecionados((atuais) =>
      atuais.includes(alunoId)
        ? atuais.filter((id) => id !== alunoId)
        : [...atuais, alunoId]
    );
  };

  const todosSelecionados =
    alunos.length > 0 &&
    alunos.every((aluno) => idsSelecionados.includes(aluno.id));

  const selecionarTodosAlunos = () => {
    setIdsSelecionados(
      todosSelecionados ? [] : alunos.map((aluno) => aluno.id),
    );
  };

  const abrirTarefasAluno = (alunoId: string) => {
    router.push({
      pathname: "/TelaTarefas",
      params: { alunoId },
    });
  };

  const alunosOrdenados = [...alunos]
    .filter((aluno) => idsSelecionados.includes(aluno.id))
    .sort((a, b) => {
      if (a.fixado && !b.fixado) return -1;
      if (!a.fixado && b.fixado) return 1;
      return a.nome.localeCompare(b.nome);
    });

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[Estilos.container, { backgroundColor: tema.background }]}
    >
      <View style={Estilos.header}>
        <View style={Estilos.topRow}>
          <Text
            style={[
              Estilos.headerTitle,
              {
                color: tema.text,
                fontSize: 30 * escalaFonte,
              },
            ]}
          >
            Tarefas das Alunas e dos Alunos
          </Text>

          <BotaoAlerta />
        </View>

        <Text
          style={[
            Estilos.studentCount,
            {
              color: tema.text,
              fontSize: 14 * escalaFonte,
            },
          ]}
        >
          {alunos.length} {alunos.length === 1 ? "aluna/aluno" : "alunas/alunos"}
        </Text>
      </View>

      {/* Botão Filtrar no padrão da TelaChat */}
      <View style={[Estilos.linhaFiltro, { backgroundColor: tema.background }]}>
        <Pressable
          style={[
            Estilos.botaoFiltro,
            { backgroundColor: colors.border + "50" },
          ]}
          onPress={() => setModalFiltroVisivel(true)}
        >
          <Ionicons name="filter" size={16} color={tema.secondaryText} />
          <Text style={[Estilos.textoFiltro, { color: tema.text}]}>
            Filtrar
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={Estilos.lista}
        contentContainerStyle={Estilos.listaConteudo}
        showsVerticalScrollIndicator={false}
      >
        {alunosOrdenados.map((aluno) => {
          const avatarEscolhido = buscarAvatar(aluno.avatar);

          return (
            <TouchableOpacity
              key={aluno.id}
              style={[
                Estilos.cardAluno,
                {
                  backgroundColor: tema.card,
                  borderColor: "#94C0DF",
                },
              ]}
              activeOpacity={0.8}
              onPress={() => abrirTarefasAluno(aluno.id)}
            >
              <View style={Estilos.avatar}>
                {avatarEscolhido ? (
                  <AvatarImagem uri={avatarEscolhido.url} tamanho={44} />
                ) : (
                  <Text
                    style={[
                      Estilos.avatarTexto,
                      { fontSize: 20 * escalaFonte },
                    ]}
                  >
                    {aluno.nome.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>

              <View style={Estilos.informacoes}>
                <Text
                  style={[
                    Estilos.nomeAluno,
                    {
                      color: tema.text,
                      fontSize: 18 * escalaFonte,
                    },
                  ]}
                >
                  {aluno.nome}
                </Text>

                <View style={Estilos.linhaInformacoes}>
                  <View style={Estilos.tagTurma}>
                    <Text
                      style={[Estilos.textoTag, { fontSize: 11 * escalaFonte }]}
                    >
                      {aluno.turma}
                    </Text>
                  </View>

                  <View style={Estilos.tagTurno}>
                    <Text
                      style={[
                        Estilos.textoTagTurno,
                        { fontSize: 11 * escalaFonte },
                      ]}
                    >
                      {aluno.turno}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    Estilos.tarefasPendentes,
                    {
                      color: tema.text,
                      fontSize: 14 * escalaFonte,
                    },
                  ]}
                >
                  {aluno.tarefasPendentes}{" "}
                  {aluno.tarefasPendentes === 1
                    ? "tarefa pendente"
                    : "tarefas pendentes"}
                </Text>
              </View>

              {/* Mesma bandeira da TelaChat */}
              <Pressable
                style={Estilos.botaoFixar}
                accessibilityRole="button"
                accessibilityLabel={
                  aluno.fixado
                    ? `Desfixar ${aluno.nome}`
                    : `Fixar ${aluno.nome}`
                }
                onPress={(event) => {
                  event.stopPropagation();
                  alternarFixado(aluno);
                }}
              >
                <Ionicons
                  name={aluno.fixado ? "bookmark" : "bookmark-outline"}
                  size={25}
                  color={aluno.fixado ? colors.primary : colors.placeholder}
                />
              </Pressable>
            </TouchableOpacity>
          );
        })}

        {!carregando && alunosOrdenados.length === 0 && (
          <View style={Estilos.semAlunos}>
            <Ionicons name="people-outline" size={64} color="#e0e0e0" />
            <Text
              style={[
                Estilos.semAlunosTexto,
                {
                  color: tema.text,
                  fontSize: 18 * escalaFonte,
                },
              ]}
            >
              {alunos.length === 0
                ? "Nenhuma aluna/nenhum aluno encontrado"
                : "Nenhuma aluna/nenhum aluno selecionado no filtro"}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Filtro no padrão da TelaChat */}
      <Modal
  visible={modalFiltroVisivel}
  animationType="slide"
  transparent
  onRequestClose={() => setModalFiltroVisivel(false)}
>
  <SafeAreaView
    edges={["top", "bottom", "left", "right"]}
    style={Estilos.modalOverlay}
  >
    <View
      accessibilityViewIsModal
      style={[
        Estilos.modalFiltro,
        { backgroundColor: tema.modal },
      ]}
    >
      {/* Cabeçalho fixo */}
      <View style={Estilos.cabecalhoFiltro}>
        <View style={Estilos.linhaTituloFiltro}>
          <Text
            accessibilityRole="header"
            style={[
              Estilos.tituloModal,
              {
                color: tema.text,
                fontSize: 18 * escalaFonte,
              },
            ]}
          >
            Filtrar Alunas/Alunos
          </Text>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{
              checked: todosSelecionados,
              disabled: alunos.length === 0,
            }}
            disabled={alunos.length === 0}
            onPress={selecionarTodosAlunos}
            style={Estilos.botaoSelecionarTodos}
          >
            <Ionicons
              name={
                todosSelecionados
                  ? "checkbox"
                  : "square-outline"
              }
              size={22}
              color={
                todosSelecionados ? colors.primary : tema.text
              }
              style={Estilos.iconeSelecionarTodos}
            />

            <Text
              style={[
                Estilos.textoSelecionarTodos,
                {
                  color: tema.text,
                  fontSize: 13 * escalaFonte,
                },
              ]}
            >
              {todosSelecionados
                ? "Desmarcar todos"
                : "Selecionar todos"}
            </Text>
          </Pressable>
        </View>

        <Text
          style={[
            Estilos.subtituloModal,
            {
              color: tema.text,
              fontSize: 13 * escalaFonte,
            },
          ]}
        >
          Selecione quais alunas e alunos deseja exibir:
        </Text>
      </View>

      {/* Somente a lista rola */}
      <FlatList
        style={Estilos.listaFiltro}
        contentContainerStyle={Estilos.listaFiltroConteudo}
        data={alunos}
        extraData={idsSelecionados}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const selecionado = idsSelecionados.includes(item.id);

          return (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selecionado }}
              accessibilityLabel={item.nome}
              style={[
                Estilos.itemFiltro,
                { borderBottomColor: tema.border },
              ]}
              onPress={() => alternarSelecaoFiltro(item.id)}
            >
              <Ionicons
                name={
                  selecionado ? "checkbox" : "square-outline"
                }
                size={22}
                color={
                  selecionado ? colors.primary : tema.text
                }
                style={Estilos.iconeFiltro}
              />

              <Text
                style={[
                  Estilos.nomeFiltro,
                  {
                    color: tema.text,
                    fontSize: 15 * escalaFonte,
                  },
                ]}
              >
                {item.nome}
              </Text>
            </Pressable>
          );
        }}
      />

      {/* Botão fixo */}
      <View style={Estilos.rodapeFiltro}>
        <Pressable
          accessibilityRole="button"
          style={[
            Estilos.botaoAplicar,
            { backgroundColor: colors.primary },
          ]}
          onPress={() => setModalFiltroVisivel(false)}
        >
          <Text
            style={[
              Estilos.textoAplicar,
              { fontSize: 16 * escalaFonte },
            ]}
          >
            Aplicar Filtro
          </Text>
        </Pressable>
      </View>
    </View>
  </SafeAreaView>
</Modal>
    </SafeAreaView>
  );
}