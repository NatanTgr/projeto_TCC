import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "../context/ThemeContext";
import { useFontSize } from "../context/FontSizeContext";

type TarefaDetalhes = {
  titulo: string;
  data: string;
  disciplina: string;
  professor: string;
  tipo: string;
  plataforma: string;
  descricao: string;
  concluido: boolean;
};

type Props = {
  visible: boolean;
  tarefa: TarefaDetalhes | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : data;
}

export default function ModalDetalhesTarefa({
  visible,
  tarefa,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  const { tema } = useTheme();
  const { escalaFonte } = useFontSize();

  if (!tarefa) return null;

  const corTipo = tarefa.tipo === "Reunião" ? "#94C0DF" : "#88C688";

  const dataHoje = new Date();
  const hoje = [
    dataHoje.getFullYear(),
    String(dataHoje.getMonth() + 1).padStart(2, "0"),
    String(dataHoje.getDate()).padStart(2, "0"),
  ].join("-");

  const atrasada = !tarefa.concluido && tarefa.data < hoje;
  const status = tarefa.concluido
    ? "Concluída"
    : atrasada
      ? "Atrasada"
      : "Pendente";
  const corStatus = tarefa.concluido
    ? "#388E3C"
    : atrasada
      ? "#C46A16"
      : "#52738A";

  const detalhe = (
    icone: keyof typeof Ionicons.glyphMap,
    rotulo: string,
    valor: string,
  ) => (
    <View style={[styles.linha, { borderBottomColor: tema.border }]}>
      <View style={[styles.icone, { backgroundColor: corTipo + "33" }]}>
        <Ionicons name={icone} size={19} color={tema.text} />
      </View>

      <View style={styles.conteudoLinha}>
        <Text
          style={[
            styles.rotulo,
            { color: tema.text, fontSize: 13 * escalaFonte },
          ]}
        >
          {rotulo}
        </Text>
        <Text
          style={[
            styles.valor,
            { color: tema.text, fontSize: 16 * escalaFonte },
          ]}
        >
          {valor?.trim() || "Não informado"}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: tema.modal }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.conteudo}
          >
            <View style={styles.cabecalho}>
              <Text
                style={[
                  styles.sobretitulo,
                  { color: tema.text, fontSize: 13 * escalaFonte },
                ]}
              >
                DETALHES DO EVENTO
              </Text>

              <TouchableOpacity
                onPress={onClose}
                style={styles.fechar}
                accessibilityLabel="Fechar detalhes"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={23} color={tema.text} />
              </TouchableOpacity>
            </View>

            <View style={[styles.faixa, { backgroundColor: corTipo }]} />

            <Text
              style={[
                styles.titulo,
                { color: tema.text, fontSize: 23 * escalaFonte },
              ]}
            >
              {tarefa.titulo}
            </Text>

            <View style={styles.etiquetas}>
              <View style={[styles.etiqueta, { backgroundColor: corTipo }]}>
                <Text
                  style={[styles.textoEtiqueta, { fontSize: 13 * escalaFonte }]}
                >
                  {tarefa.tipo}
                </Text>
              </View>

              <View
                style={[
                  styles.etiqueta,
                  { borderColor: corStatus, borderWidth: 1 },
                ]}
              >
                <Text
                  style={[
                    styles.textoEtiqueta,
                    { color: corStatus, fontSize: 13 * escalaFonte },
                  ]}
                >
                  {status}
                </Text>
              </View>
            </View>

            <View style={[styles.bloco, { backgroundColor: tema.card }]}>
              {detalhe("calendar-outline", "Data", formatarData(tarefa.data))}
              {detalhe("book-outline", "Disciplina", tarefa.disciplina)}
              {detalhe("person-outline", "Professor", tarefa.professor)}
              {detalhe(
                "desktop-outline",
                "Plataforma",
                tarefa.plataforma,
              )}
            </View>

            <View style={[styles.blocoDescricao, { backgroundColor: tema.card }]}>
              <View style={styles.tituloDescricao}>
                <Ionicons
                  name="document-text-outline"
                  size={19}
                  color={tema.text}
                />
                <Text
                  style={[
                    styles.rotuloDescricao,
                    { color: tema.text, fontSize: 15 * escalaFonte },
                  ]}
                >
                  Descrição
                </Text>
              </View>

              <Text
                style={[
                  styles.descricao,
                  { color: tema.text, fontSize: 16 * escalaFonte },
                ]}
              >
                {tarefa.descricao?.trim() || "Sem descrição."}
              </Text>
            </View>

            <View style={styles.acoes}>
              <TouchableOpacity
                style={[styles.botaoPrincipal, { backgroundColor: corTipo }]}
                onPress={onEdit}
                accessibilityRole="button"
              >
                <Ionicons name="create-outline" size={20} color="#17232B" />
                <Text
                  style={[
                    styles.textoPrincipal,
                    { fontSize: 15 * escalaFonte },
                  ]}
                >
                  Editar evento
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botaoExcluir, { borderColor: "#D65757" }]}
                onPress={onDelete}
                accessibilityRole="button"
              >
                <Ionicons name="trash-outline" size={19} color="#C64141" />
                <Text
                  style={[
                    styles.textoExcluir,
                    { fontSize: 15 * escalaFonte },
                  ]}
                >
                  Excluir evento
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "85%",
    borderRadius: 22,
    overflow: "hidden",
  },
  conteudo: {
    padding: 20,
    paddingBottom: 24,
  },
  cabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sobretitulo: {
    fontWeight: "700",
    letterSpacing: 1,
    opacity: 0.7,
    flexShrink: 1,
  },
  fechar: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  faixa: {
    width: 44,
    height: 5,
    borderRadius: 5,
    marginBottom: 14,
  },
  titulo: {
    fontWeight: "bold",
    lineHeight: 30,
    marginBottom: 14,
  },
  etiquetas: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  etiqueta: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  textoEtiqueta: {
    color: "#17232B",
    fontWeight: "700",
  },
  bloco: {
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  icone: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  conteudoLinha: {
    flex: 1,
  },
  rotulo: {
    opacity: 0.7,
    marginBottom: 3,
  },
  valor: {
    fontWeight: "600",
  },
  blocoDescricao: {
    borderRadius: 16,
    padding: 16,
  },
  tituloDescricao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  rotuloDescricao: {
    fontWeight: "700",
  },
  descricao: {
    lineHeight: 24,
  },
  acoes: {
    gap: 10,
    marginTop: 20,
  },
  botaoPrincipal: {
    minHeight: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 10,
  },
  textoPrincipal: {
    color: "#17232B",
    fontWeight: "700",
  },
  botaoExcluir: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 10,
  },
  textoExcluir: {
    color: "#C64141",
    fontWeight: "700",
  },
});