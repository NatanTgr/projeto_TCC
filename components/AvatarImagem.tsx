import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";

const cache = new Map<string, string>();

type Props = {
  uri: string;
  tamanho?: number;
};

export default function AvatarImagem({
  uri,
  tamanho = 80,
}: Props) {
  const [xml, setXml] = useState<string | null>(
    cache.get(uri) ?? null,
  );

  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let componenteAtivo = true;

    const controller = new AbortController();

    const timer = setTimeout(() => {
      controller.abort();
    }, 15000);

    setErro(false);
    setXml(cache.get(uri) ?? null);

    async function carregarAvatar() {
      if (cache.has(uri)) {
        clearTimeout(timer);
        return;
      }

      try {
        const resposta = await fetch(uri, {
          signal: controller.signal,
        });

        if (!resposta.ok) {
          const detalhe = await resposta.text();

          console.log("DiceBear retornou erro:", {
            status: resposta.status,
            detalhe,
            uri,
          });

          throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const svg = await resposta.text();

        if (!svg.includes("<svg")) {
          throw new Error("A resposta não contém um SVG.");
        }

        if (componenteAtivo) {
          cache.set(uri, svg);
          setXml(svg);
        }
      } catch (erro) {
        console.log("Erro ao carregar avatar:", erro);
        console.log("URL do avatar:", uri);

        if (componenteAtivo) {
          setErro(true);
        }
      } finally {
        clearTimeout(timer);
      }
    }

    carregarAvatar();

    return () => {
      componenteAtivo = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [uri, tentativa]);

  return (
    <View
      style={{
        width: tamanho,
        height: tamanho,
        borderRadius: tamanho / 2,
        backgroundColor: "#dcebf7",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {erro ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Tentar carregar o avatar novamente"
          onPress={(evento) => {
            evento.stopPropagation();
            setTentativa((valorAtual) => valorAtual + 1);
          }}
          style={{
            minWidth: 48,
            minHeight: 48,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#26394a",
              fontSize: 22,
            }}
          >
            ↻
          </Text>
        </TouchableOpacity>
      ) : xml ? (
        <SvgXml
          xml={xml}
          width={tamanho}
          height={tamanho}
          onError={() => {
            cache.delete(uri);
            setErro(true);
          }}
        />
      ) : (
        <ActivityIndicator
          color="#315f8a"
          accessibilityLabel="Carregando avatar"
        />
      )}
    </View>
  );
}