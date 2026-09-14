import { View, Text, TouchableOpacity, ScrollView, Modal} from "react-native";
//import { router, Link } from 'expo-router';
import { useEffect, useState } from "react";
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
      <Text style={[Estilos.titulo, { color: tema.text }]}>Configurações</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={Estilos.tela}>
          <View style={[Estilos.cardPerfil, { backgroundColor: tema.modal }]}>
            <Text>
              Tamanho atual: {tamanhoFonte} - Escala: {escalaFonte}
            </Text>
            <Text style={[Estilos.texto, { color: tema.text }]}>
              Perfil do Aluno
            </Text>
            <Text style={[Estilos.texto2, { color: tema.text }]}>
              Tipo da conta: Estudante e etc...
            </Text>
          </View>

          <View style={[Estilos.cardTutorial, { backgroundColor: tema.modal }]}>
            <Text style={[Estilos.texto, { color: tema.text }]}>
              Vídeo Tutorial
            </Text>
          </View>

          <View style={[Estilos.cardConfig, { backgroundColor: tema.modal }]}>
            <Text style={[Estilos.textoConfiguracoes, { color: tema.text }]}>
              {" "}
              Configurações
            </Text>

            <View>
              <Text style={{ color: tema.text }}>Tema do aplicativo</Text>

              <TouchableOpacity
                onPress={() => selecionarTema("claro")}
                style={{
                  backgroundColor: tipoTema === "claro" ? "#94C0DF" : tema.card,
                  padding: 15,
                  borderRadius: 10,
                  marginTop: 10,
                  borderWidth: 1,
                  borderColor: tema.border,
                }}
              >
                <Text style={{ color: tema.text }}>☀️ Tema Claro</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => selecionarTema("escuro")}
                style={{
                  backgroundColor:
                    tipoTema === "escuro" ? "#94C0DF" : tema.card,
                  padding: 15,
                  borderRadius: 10,
                  marginTop: 10,
                  borderWidth: 1,
                  borderColor: tema.border,
                }}
              >
                <Text style={{ color: tema.text }}>🌙 Tema Escuro</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => selecionarTema("forte")}
                style={{
                  backgroundColor: tipoTema === "forte" ? "#FF6B00" : tema.card,
                  padding: 15,
                  borderRadius: 10,
                  marginTop: 10,
                  borderWidth: 1,
                  borderColor: tema.border,
                }}
              >
                <Text style={{ color: tema.text }}>🌈 Tema Forte</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[Estilos.cardOpcoes, { backgroundColor: tema.card }]}
              onPress={() => setModalTamanhoFonte(true)}
            >
              <Text style={[Estilos.texto, { color: tema.text }]}>
                🔤 Tamanho da letra
              </Text>

              <Text style={{ color: tema.text }}>Atual: {tamanhoFonte}</Text>
            </TouchableOpacity>

            <View
              style={[Estilos.cardNotiChat, { backgroundColor: tema.card }]}
            >
              <Text style={[Estilos.texto, { color: tema.text }]}>
                Notificações de Chat
              </Text>
            </View>

            <View
              style={[Estilos.cardLembrete, { backgroundColor: tema.card }]}
            >
              <Text style={[Estilos.texto, { color: tema.text }]}>
                Lembretes de Tarefas
              </Text>
            </View>
          </View>
          <TouchableOpacity style={Estilos.botaoSair}>
            <Text style={Estilos.textoBotaoSair}>Sair da conta</Text>
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
