
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SvgXml } from "react-native-svg";

// =====================================================
// CACHE DOS AVATARES SVG
// =====================================================

const cache = new Map<string, string>();

type Props = {
  uri: string;
  tamanho?: number;
};

type SvgCarregado = {
  uri: string;
  xml: string;
};

// =====================================================
// COMPONENTE AVATAR
// =====================================================

export default function AvatarImagem({
  uri,
  tamanho = 80,
}: Props) {
  const [svgCarregado, setSvgCarregado] =
    useState<SvgCarregado | null>(() => {
      const svgEmCache = cache.get(uri);

      return svgEmCache
        ? { uri, xml: svgEmCache }
        : null;
    });

  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  const [carregandoWeb, setCarregandoWeb] = useState(
    Platform.OS === "web"
  );

  // Evita mostrar o avatar anterior
  // quando a URL do componente muda.

  const xml =
    svgCarregado?.uri === uri
      ? svgCarregado.xml
      : cache.get(uri) ?? null;

  // =====================================================
  // CARREGAR AVATAR
  // =====================================================

  useEffect(() => {
    let componenteAtivo = true;

    setErro(false);

    // Na web, o próprio navegador carrega o SVG
    // diretamente através do componente Image.
    //
    // Isso evita problemas de renderização do SvgXml.

    if (Platform.OS === "web") {
      setCarregandoWeb(true);

      return () => {
        componenteAtivo = false;
      };
    }

    // ===================================================
    // VERIFICAR CACHE NO ANDROID / IOS
    // ===================================================

    const svgEmCache = cache.get(uri);

    if (svgEmCache) {
      setSvgCarregado({
        uri,
        xml: svgEmCache,
      });

      return () => {
        componenteAtivo = false;
      };
    }

    setSvgCarregado(null);

    // ===================================================
    // CONTROLE DE CANCELAMENTO
    // ===================================================

    const controller = new AbortController();

    const timer = setTimeout(() => {
      controller.abort();
    }, 15000);

    // ===================================================
    // BUSCAR SVG
    // ===================================================

    const carregarAvatar = async (): Promise<void> => {
      try {
        const resposta = await fetch(uri, {
          signal: controller.signal,
        });

        if (!resposta.ok) {
          const detalhe = await resposta.text();

          console.error("DiceBear retornou erro:", {
            status: resposta.status,
            detalhe,
            uri,
          });

          throw new Error(
            `Erro HTTP: ${resposta.status}`
          );
        }

        const svg = await resposta.text();

        if (!/<svg(?:\s|>)/i.test(svg)) {
          throw new Error(
            "A resposta não contém um SVG válido."
          );
        }

        if (!componenteAtivo) {
          return;
        }

        // Guarda o SVG em cache.
        cache.set(uri, svg);

        // Atualiza somente o avatar correspondente.
        setSvgCarregado({
          uri,
          xml: svg,
        });
      } catch (erro) {
        if (!componenteAtivo) {
          return;
        }

        console.error(
          "Erro ao carregar avatar:",
          erro
        );

        console.error(
          "URL do avatar:",
          uri
        );

        setErro(true);
      } finally {
        clearTimeout(timer);
      }
    };

    // ===================================================
    // CORREÇÃO SONARCLOUD S9383
    // ===================================================

    void carregarAvatar().catch((erro) => {
      if (!componenteAtivo) {
        return;
      }

      console.error(
        "Erro inesperado ao carregar avatar:",
        erro
      );

      setErro(true);
    });

    // ===================================================
    // LIMPEZA
    // ===================================================

    return () => {
      componenteAtivo = false;

      clearTimeout(timer);

      controller.abort();
    };
  }, [uri, tentativa]);

  // =====================================================
  // TENTAR NOVAMENTE
  // =====================================================

  const tentarNovamente = () => {
    setErro(false);
    setSvgCarregado(null);
    setCarregandoWeb(Platform.OS === "web");

    setTentativa((valorAtual) => valorAtual + 1);
  };

  // =====================================================
  // TRATAR ERRO DO SVG
  // =====================================================

  const tratarErroSvg = () => {
    cache.delete(uri);

    setSvgCarregado(null);
    setErro(true);

    console.error(
      "Não foi possível renderizar o SVG do avatar:",
      uri
    );
  };

  // =====================================================
  // INTERFACE
  // =====================================================

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
      {/* ERRO DE CARREGAMENTO */}

      {erro ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Tentar carregar o avatar novamente"
          onPress={(evento) => {
            evento.stopPropagation();

            tentarNovamente();
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
      ) : Platform.OS === "web" ? (
        // ===============================================
        // WEB: RENDERIZA SVG DIRETAMENTE PELA URL
        // ===============================================

        <>
          <Image
            key={`${uri}-${tentativa}`}
            source={{ uri }}
            resizeMode="contain"
            accessibilityLabel="Avatar do usuário"
            style={{
              width: tamanho,
              height: tamanho,
            }}
            onLoad={() => {
              setCarregandoWeb(false);
            }}
            onError={() => {
              console.error("Erro ao carregar imagem do avatar na web:", uri);

              setCarregandoWeb(false);
              setErro(true);
            }}
          />

          {carregandoWeb && (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#dcebf7",
                },
              ]}
            >
              <ActivityIndicator
                color="#315f8a"
                accessibilityLabel="Carregando avatar"
              />
            </View>
          )}
        </>
      ) : xml ? (
        // ===============================================
        // ANDROID / IOS: RENDERIZA SVG PELO XML
        // ===============================================

        <SvgXml
          xml={xml}
          width={tamanho}
          height={tamanho}
          onError={tratarErroSvg}
        />
      ) : (
        // ===============================================
        // CARREGAMENTO NATIVO
        // ===============================================

        <ActivityIndicator
          color="#315f8a"
          accessibilityLabel="Carregando avatar"
        />
      )}
    </View>
  );
}
