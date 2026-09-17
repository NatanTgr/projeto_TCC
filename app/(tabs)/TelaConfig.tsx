import { View, Text, TouchableOpacity, ScrollView, Modal} from "react-native";
//import { router, Link } from 'expo-router';
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import Estilos from "../../Estilos/TelaConfigEstilo";
import { testarSupabase } from "../../bd/testeSupabase";
import { useFontSize } from "../../context/FontSizeContext";

export default function TelaConfig() {

  const [modalTamanhoFonte, setModalTamanhoFonte] = useState(false);

  useEffect(() => {
    testarSupabase();
  }, []);

  const { tipoTema, selecionarTema, tema } = useTheme();

  const { tamanhoFonte, escalaFonte, selecionarTamanhoFonte } = useFontSize();

  return (
    <View
      style={[
        Estilos.container,
        {
          backgroundColor: tema.background,
        },
      ]}
    >
      <View style={Estilos.cabecalhoConfig}>
        <Text style={[Estilos.titulo, { color: tema.text, fontSize: 25 * escalaFonte }]}>
          Configurações
        </Text>

        <TouchableOpacity
          style={Estilos.botaoAlerta}
          onPress={() => {
            // Futuramente: enviar alerta para o tutor
          }}
        >
          <Text
            style={[
              Estilos.textoAlerta,
              {
                fontSize: 14 * escalaFonte,
              },
            ]}
          >
            ALERTA
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={Estilos.tela}>
          <View style={[Estilos.cardPerfil, { backgroundColor: tema.modal }]}>
            {/* Avatar + informações */}
            <View style={Estilos.perfilTopo}>
              {/* Avatar */}
              <View style={Estilos.avatarContainer}>
                <Text style={Estilos.avatarTexto}>👤</Text>
              </View>

              {/* Informações do usuário */}
              <View style={Estilos.informacoesPerfil}>
                <Text
                  style={[
                    Estilos.nomePerfil,
                    {
                      color: tema.text,
                      fontSize: 21 * escalaFonte,
                    },
                  ]}
                >
                  Natan Rodrigues
                </Text>

                <Text
                  style={[
                    Estilos.tipoPerfil,
                    {
                      color: tema.text,
                      fontSize: 16 * escalaFonte,
                    },
                  ]}
                >
                  Estudante
                </Text>

                <Text
                  style={[
                    Estilos.detalhesPerfil,
                    {
                      color: tema.text,
                      fontSize: 14 * escalaFonte,
                    },
                  ]}
                >
                  Técnico em Informática • Manhã
                </Text>

                <Text
                  style={[
                    Estilos.detalhesPerfil,
                    {
                      color: tema.text,
                      fontSize: 14 * escalaFonte,
                    },
                  ]}
                >
                  Turma: 4º ano
                </Text>
              </View>
            </View>

            {/* Botão para trocar avatar */}
            <TouchableOpacity
              style={[
                Estilos.botaoAvatar,
                {
                  backgroundColor: tema.card,
                  borderColor: tema.border,
                },
              ]}
            >
              <Feather name="edit-2" size={18} color={tema.text} />

              <Text
                style={[
                  Estilos.textoBotaoAvatar,
                  {
                    color: tema.text,
                    fontSize: 15 * escalaFonte,
                  },
                ]}
              >
                Alterar avatar
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[Estilos.cardTutorial, { backgroundColor: tema.modal }]}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Feather name="play-circle" size={26} color="#4CAF50" />

              <Text
                style={[
                  Estilos.texto,
                  {
                    color: tema.text,
                    fontSize: 18 * escalaFonte,
                  },
                ]}
              >
                Vídeo Tutorial
              </Text>
            </View>
          </TouchableOpacity>

          <View style={[Estilos.cardConfig, { backgroundColor: tema.modal }]}>
            <View style={{ width: "100%" }}>
              <Text
                style={{
                  color: tema.text,
                  fontSize: 20 * escalaFonte,
                  marginBottom: 10,
                  textAlign: "center",
                }}
              >
                Tema do aplicativo
              </Text>

              <View style={Estilos.botoesTema}>
                <TouchableOpacity
                  onPress={() => selecionarTema("claro")}
                  style={[
                    Estilos.botaoTema,
                    {
                      backgroundColor:
                        tipoTema === "claro" ? "#94C0DF" : tema.card,
                      borderColor: tema.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: tema.text,
                      fontSize: 14 * escalaFonte,
                    }}
                  >
                    ☀️ Claro
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => selecionarTema("escuro")}
                  style={[
                    Estilos.botaoTema,
                    {
                      backgroundColor:
                        tipoTema === "escuro" ? "#94C0DF" : tema.card,
                      borderColor: tema.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: tema.text,
                      fontSize: 14 * escalaFonte,
                    }}
                  >
                    🌙 Escuro
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => selecionarTema("forte")}
                  style={[
                    Estilos.botaoTema,
                    {
                      backgroundColor:
                        tipoTema === "forte" ? "#FF6B00" : tema.card,
                      borderColor: tema.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: tema.text,
                      fontSize: 14 * escalaFonte,
                    }}
                  >
                    🌈 Forte
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                Estilos.cardOpcoes,
                {
                  backgroundColor: tema.card,
                },
              ]}
              onPress={() => setModalTamanhoFonte(true)}
            >
              <View>
                <Text
                  style={[
                    Estilos.texto,
                    {
                      color: tema.text,
                      fontSize: 18 * escalaFonte,
                    },
                  ]}
                >
                  🔤 Tamanho da letra
                </Text>

                <Text
                  style={{
                    color: tema.text,
                    fontSize: 14 * escalaFonte,
                    marginTop: 5,
                  }}
                >
                  Atual: {tamanhoFonte}
                </Text>
              </View>

              <Feather name="chevron-right" size={24} color={tema.text} />
            </TouchableOpacity>

            <View
              style={[Estilos.cardNotiChat, { backgroundColor: tema.card }]}
            >
              <Text style={[Estilos.texto, { color: tema.text, fontSize: 16 * escalaFonte }]}>
                Notificações de Chat
              </Text>
            </View>

            <View
              style={[Estilos.cardLembrete, { backgroundColor: tema.card }]}
            >
              <Text style={[Estilos.texto, { color: tema.text, fontSize: 16 * escalaFonte }]}>
                Lembretes de Tarefas
              </Text>
            </View>
          </View>
          <TouchableOpacity style={Estilos.botaoSair}>
            <Text style={[Estilos.textoBotaoSair, { fontSize: 16 * escalaFonte }]}>
              Sair da conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal
        visible={modalTamanhoFonte}
        transparent
        animationType="fade"
        onRequestClose={() => setModalTamanhoFonte(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              width: "85%",
              padding: 20,
              borderRadius: 15,
              backgroundColor: tema.modal,
            }}
          >
            <Text
              style={{
                color: tema.text,
                fontSize: 22 * escalaFonte,
                fontWeight: "bold",
                marginBottom: 20,
              }}
            >
              Tamanho da letra
            </Text>

            <TouchableOpacity
              onPress={() => {
                selecionarTamanhoFonte("pequeno");
                setModalTamanhoFonte(false);
              }}
              style={{
                padding: 15,
                borderRadius: 10,
                marginBottom: 10,
                backgroundColor:
                  tamanhoFonte === "pequeno" ? "#94C0DF" : tema.card,
                borderWidth: 1,
                borderColor: tema.border,
              }}
            >
              <Text
                style={{
                  color: tema.text,
                  fontSize: 14 * escalaFonte,
                }}
              >
                A — Pequeno
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                selecionarTamanhoFonte("normal");
                setModalTamanhoFonte(false);
              }}
              style={{
                padding: 15,
                borderRadius: 10,
                marginBottom: 10,
                backgroundColor:
                  tamanhoFonte === "normal" ? "#94C0DF" : tema.card,
                borderWidth: 1,
                borderColor: tema.border,
              }}
            >
              <Text
                style={{
                  color: tema.text,
                  fontSize: 16 * escalaFonte,
                }}
              >
                A — Normal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                selecionarTamanhoFonte("grande");
                setModalTamanhoFonte(false);
              }}
              style={{
                padding: 15,
                borderRadius: 10,
                marginBottom: 10,
                backgroundColor:
                  tamanhoFonte === "grande" ? "#94C0DF" : tema.card,
                borderWidth: 1,
                borderColor: tema.border,
              }}
            >
              <Text
                style={{
                  color: tema.text,
                  fontSize: 18 * escalaFonte,
                }}
              >
                A — Grande
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                selecionarTamanhoFonte("muitoGrande");
                setModalTamanhoFonte(false);
              }}
              style={{
                padding: 15,
                borderRadius: 10,
                marginBottom: 10,
                backgroundColor:
                  tamanhoFonte === "muitoGrande" ? "#94C0DF" : tema.card,
                borderWidth: 1,
                borderColor: tema.border,
              }}
            >
              <Text
                style={{
                  color: tema.text,
                  fontSize: 20 * escalaFonte,
                }}
              >
                A — Muito grande
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalTamanhoFonte(false)}
              style={{
                padding: 15,
                borderRadius: 10,
                marginTop: 5,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: tema.text,
                  fontSize: 16 * escalaFonte,
                  fontWeight: "bold",
                }}
              >
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
