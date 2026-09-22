export const DICEBEAR_BASE =
  "https://api.dicebear.com/10.x/avataaars/svg";

/*
 * Cabelos associados aos avatares
 * de aparência feminina.
 */
const CABELOS_FEMININOS = [
  "bob",
  "bun",
  "curly",
  "curvy",
  "longButNotTooLong",
  "straight01",
  "straight02",
  "straightAndStrand",
  "bigHair",
  "miaWallace",
];

/*
 * Cabelos associados aos avatares
 * de aparência masculina.
 */
const CABELOS_MASCULINOS = [
  "shortFlat",
  "shortRound",
  "shortWaved",
  "theCaesar",
  "shaggy",
  "fro",
  "dreads01",
  "shaggyMullet",
  "shaggy",
];

/*
 * Cabelos afro utilizados nos avatares
 * com tons de pele mais escuros.
 */
const CABELOS_AFRO_FEMININOS = [
  "fro",
  "curly",
  "bigHair",
];

const CABELOS_AFRO_MASCULINOS = [
  "dreads01",
];

/*
 * Posições que receberão cabelo afro.
 *
 * São 6 avatares:
 * - 3 de aparência feminina;
 * - 3 de aparência masculina;
 * - 3 no primeiro tom escuro;
 * - 3 no segundo tom escuro.
 */
const POSICOES_CABELO_AFRO = [
  0,
  7,
  12,
  19,
  24,
  31,
];

/*
 * Cores naturais de cabelo.
 * Não inclui rosa, vermelho, branco ou cinza.
 */
const CORES_CABELO = [
  "2c1b18", // preto
  "4a312c", // castanho muito escuro
  "724133", // castanho escuro
  "b58143", // castanho claro
  "d6b370", // loiro
];

/*
 * Seis tons de pele distribuídos igualmente.
 *
 * Como existem 36 avatares, cada tom
 * aparecerá exatamente 6 vezes.
 */
const CORES_PELE = [
  "614335", // pele escura
  "ae5d29", // pele marrom-escura
  "d08b5b", // pele marrom-média
  "fd9841", // pele média
  "edb98a", // pele clara-média
  "ffdbb4", // pele clara
];

/*
 * Cores de roupas permitidas.
 * Não inclui branco nem tons quase brancos.
 */
const CORES_ROUPA = [
  "262e33", // preto
  "65c9ff", // azul-claro
  "5199e4", // azul
  "25557c", // azul-escuro
  "929598", // cinza
  "3c4f5c", // cinza-azulado
  "b1e2ff", // azul pastel
  "a7ffc4", // verde pastel
  "ffafb9", // rosa-claro
  "ffffb1", // amarelo-claro
  "ff488e", // rosa
  "ff5c5c", // vermelho
];

/*
 * Somente óculos comuns ou de grau.
 */
const OCULOS_PERMITIDOS = [
  "prescription01",
  "prescription02",
  "round",
];

/*
 * Expressões neutras, felizes
 * ou sorridentes.
 */
const EXPRESSOES = [
  {
    mouth: "smile",
    eyes: "default",
    eyebrows: "default",
  },
  {
    mouth: "smile",
    eyes: "happy",
    eyebrows: "default",
  },
  {
    mouth: "default",
    eyes: "default",
    eyebrows: "default",
  },
];

export const AVATARES = Array.from(
  { length: 36 },
  (_, indice) => {
    const numero = String(indice + 1).padStart(
      2,
      "0",
    );

    const id = `avatar-${numero}`;

    /*
     * Os primeiros 18 terão aparência feminina.
     * Os últimos 18 terão aparência masculina.
     */
    const aparencia =
      indice < 18 ? "feminina" : "masculina";

    /*
     * Como 18 é divisível por 6, cada metade
     * possui 3 avatares de cada tom de pele.
     */
    const indicePele =
      indice % CORES_PELE.length;

    const corPele =
      CORES_PELE[indicePele];

    /*
     * Os dois primeiros itens da lista
     * representam os tons mais escuros.
     */
    const possuiPeleEscura =
      indicePele === 0 || indicePele === 1;

    /*
     * Exatamente 6 dos 12 avatares com os
     * dois tons mais escuros terão cabelo afro.
     */
    const indiceCabeloAfro =
      POSICOES_CABELO_AFRO.indexOf(indice);

    const deveTerCabeloAfro =
      possuiPeleEscura &&
      indiceCabeloAfro !== -1;

    let cabelo: string;

    if (
      aparencia === "feminina" &&
      deveTerCabeloAfro
    ) {
      cabelo =
        CABELOS_AFRO_FEMININOS[
          indiceCabeloAfro %
            CABELOS_AFRO_FEMININOS.length
        ];
    } else if (
      aparencia === "masculina" &&
      deveTerCabeloAfro
    ) {
      cabelo =
        CABELOS_AFRO_MASCULINOS[
          indiceCabeloAfro %
            CABELOS_AFRO_MASCULINOS.length
        ];
    } else if (aparencia === "feminina") {
      cabelo =
        CABELOS_FEMININOS[
          indice % CABELOS_FEMININOS.length
        ];
    } else {
      cabelo =
        CABELOS_MASCULINOS[
          indice % CABELOS_MASCULINOS.length
        ];
    }

    /*
     * Avatares de pele escura terão cabelos
     * pretos ou castanhos escuros.
     */
    const corCabelo = possuiPeleEscura
      ? CORES_CABELO[indice % 3]
      : CORES_CABELO[
          indice % CORES_CABELO.length
        ];

    const corRoupa =
      CORES_ROUPA[
        indice % CORES_ROUPA.length
      ];

    const expressao =
      EXPRESSOES[
        indice % EXPRESSOES.length
      ];

    /*
     * Um em cada quatro avatares terá
     * óculos comuns ou de grau.
     *
     * Em 36 avatares, serão 9 com óculos.
     */
    const possuiOculos =
      indice % 4 === 0;

    const oculos =
      OCULOS_PERMITIDOS[
        indice % OCULOS_PERMITIDOS.length
      ];

    const parametros = new URLSearchParams({
      /*
       * A versão v10 impede que o aplicativo
       * reutilize os avatares antigos do cache.
       */
      seed: `paed-avataaars-v10-${id}`,

      topVariant: cabelo,
      hairColor: corCabelo,
      skinColor: corPele,
      clothesColor: corRoupa,

      mouthVariant: expressao.mouth,
      eyesVariant: expressao.eyes,
      eyebrowsVariant: expressao.eyebrows,

      facialHairProbability: "0",

      accessoriesProbability: possuiOculos
        ? "100"
        : "0",

      accessoriesVariant: oculos,
    });

    const detalhesDescricao: string[] = [
      `aparência ${aparencia}`,
    ];

    if (deveTerCabeloAfro) {
      detalhesDescricao.push("cabelo afro");
    }

    if (possuiOculos) {
      detalhesDescricao.push("óculos de grau");
    }

    return {
      id,
      nome: `Avatar ${indice + 1}`,
      descricao: `Avatar com ${detalhesDescricao.join(
        ", ",
      )}`,
      url: `${DICEBEAR_BASE}?${parametros.toString()}`,
    };
  },
);

export function buscarAvatar(
  valor: string | null | undefined,
) {
  if (!valor) {
    return undefined;
  }

  /*
   * Procura pela URL atual ou pelo
   * identificador do avatar.
   */
  const correspondenciaExata = AVATARES.find(
    (avatar) =>
      avatar.url === valor ||
      avatar.id === valor,
  );

  if (correspondenciaExata) {
    return correspondenciaExata;
  }

  /*
   * Mantém compatibilidade com avatares
   * salvos usando versões anteriores.
   *
   * Uma URL antiga contendo avatar-01,
   * por exemplo, será ligada ao novo avatar-01.
   */
  const idAnterior =
    valor.match(/avatar-\d{2}/)?.[0];

  if (!idAnterior) {
    return undefined;
  }

  return AVATARES.find(
    (avatar) => avatar.id === idAnterior,
  );
}