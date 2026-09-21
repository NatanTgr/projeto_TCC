export const DICEBEAR_BASE =
  "https:/" + "/api.dicebear.com/10.x/avataaars/svg";

const OCULOS_PERMITIDOS = [
  "prescription01",
  "prescription02",
  "round",
].join(",");

// Alguns avatares terão óculos de grau.
// Todos terão expressão feliz.
// Cabelo, pele e roupa continuarão variados.
export const AVATARES = Array.from(
  { length: 30 },
  (_, indice) => {
    const numero = String(indice + 1).padStart(2, "0");
    const id = `avatar-${numero}`;

    const seed = encodeURIComponent(
      `catalogo-feliz-v2-${id}`,
    );

    const oculos = encodeURIComponent(
      OCULOS_PERMITIDOS,
    );

    return {
      id,
      nome: `Avatar ${indice + 1}`,
      descricao:
        "Avatar feliz com possibilidade de óculos de grau",

      url:
        `${DICEBEAR_BASE}?seed=${seed}` +
        `&accessoriesVariant=${oculos}` +
        "&accessoriesProbability=30" +
        "&mouthVariant=smile",
    };
  },
);

export function buscarAvatar(
  valor: string | null | undefined,
) {
  if (!valor) {
    return undefined;
  }

  const correspondenciaExata = AVATARES.find(
    (avatar) =>
      avatar.url === valor ||
      avatar.id === valor,
  );

  if (correspondenciaExata) {
    return correspondenciaExata;
  }

  const idAnterior =
    valor.match(/avatar-\d{2}/)?.[0];

  return AVATARES.find(
    (avatar) => avatar.id === idAnterior,
  );
}