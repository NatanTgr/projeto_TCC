import { View, Text, Switch, TouchableOpacity, ScrollView, Button} from "react-native";
//import { router, Link } from 'expo-router';
import { useTheme } from "../../context/ThemeContext";
import Estilos from "../../Estilos/TelaConfigEstilo";

export default function TelaConfig() {
  const { tipoTema, selecionarTema, tema } = useTheme();

  return (
    <View
      style={[
        Estilos.container,
        {
          backgroundColor: tema.background,
        },
      ]}
    >
      <Text style={[Estilos.titulo,
        {color: tema.text}
      ]}>Configurações</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={Estilos.tela}>
          <View style={[Estilos.cardPerfil,
            {backgroundColor: tema.modal}
          ]}>
            <Text style={[Estilos.texto,
              {color: tema.text}
            ]}>Perfil do Aluno</Text>
            <Text style={[Estilos.texto2,
              {color: tema.text}
            ]}>
              Tipo da conta: Estudante e etc...
            </Text>
          </View>

          <View style={[Estilos.cardTutorial,
            {backgroundColor: tema.modal}
          ]}>
            <Text style={[Estilos.texto,
              {color: tema.text}
            ]}>Vídeo Tutorial</Text>
          </View>

          <View style={[Estilos.cardConfig,
            {backgroundColor: tema.modal}
          ]}>
            <Text style={[Estilos.textoConfiguracoes,
              {color: tema.text}
            ]}
            > Configurações</Text>

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

            <View style={[Estilos.cardOpcoes,
              {backgroundColor: tema.card}
            ]}>
              <Text style={[Estilos.texto,
                {color: tema.text}
              ]}>Outras Opções</Text>
            </View>

            <View style={[Estilos.cardNotiChat,
              {backgroundColor: tema.card}
            ]}>
              <Text style={[Estilos.texto,
                {color: tema.text}
              ]}>Notificações de Chat</Text>

              
            </View>

            <View style={[Estilos.cardLembrete,
              {backgroundColor: tema.card}
            ]}>
              <Text style={[Estilos.texto,
                {color: tema.text}
              ]}>Lembretes de Tarefas</Text>

              
            </View>
          </View>
          <TouchableOpacity style={Estilos.botaoSair}>
            <Text style={Estilos.textoBotaoSair}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
