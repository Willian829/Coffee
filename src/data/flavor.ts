/**
 * Roda de Sabores do Provador de Café — SCA & World Coffee Research (2016),
 * baseada no Léxico Sensorial da WCR. Tradução livre para o português.
 */
export type FlavorNode = { name: string; color?: string; children?: FlavorNode[] };

const leaves = (names: string[]): FlavorNode[] => names.map((name) => ({ name }));

export const flavorWheel: FlavorNode = {
  name: "Sabores",
  children: [
    {
      name: "Floral",
      color: "#d35b8c",
      children: [{ name: "Chá preto" }, { name: "Floral", children: leaves(["Camomila", "Rosa", "Jasmim"]) }],
    },
    {
      name: "Frutado",
      color: "#d6453d",
      children: [
        { name: "Frutas vermelhas", children: leaves(["Amora", "Framboesa", "Mirtilo", "Morango"]) },
        { name: "Frutas secas", children: leaves(["Uva-passa", "Ameixa seca"]) },
        { name: "Outras frutas", children: leaves(["Coco", "Cereja", "Romã", "Abacaxi", "Uva", "Maçã", "Pêssego", "Pera"]) },
        { name: "Cítricos", children: leaves(["Toranja", "Laranja", "Limão-siciliano", "Limão"]) },
      ],
    },
    {
      name: "Ácido / Fermentado",
      color: "#d8b42c",
      children: [
        { name: "Ácido", children: leaves(["Aromas ácidos", "Ácido acético", "Ácido butírico", "Ácido isovalérico", "Ácido cítrico", "Ácido málico"]) },
        { name: "Alcoólico / Fermentado", children: leaves(["Vinho", "Uísque", "Fermentado", "Passado do ponto"]) },
      ],
    },
    {
      name: "Verde / Vegetal",
      color: "#3f9a55",
      children: [
        { name: "Azeite" },
        { name: "Cru" },
        { name: "Verde / Vegetal", children: leaves(["Imaturo", "Vagem", "Fresco", "Verde-escuro", "Vegetal", "Feno", "Ervas"]) },
        { name: "Leguminoso" },
      ],
    },
    {
      name: "Outros",
      color: "#5f8fa3",
      children: [
        { name: "Papel / Mofo", children: leaves(["Velho", "Papelão", "Papel", "Madeira", "Mofo úmido", "Poeira", "Terra", "Animal", "Caldo de carne", "Fenólico"]) },
        { name: "Químico", children: leaves(["Amargo", "Salgado", "Medicinal", "Petróleo", "Gambá", "Borracha"]) },
      ],
    },
    {
      name: "Torrado",
      color: "#a5683a",
      children: [
        { name: "Tabaco de cachimbo" },
        { name: "Tabaco" },
        { name: "Queimado", children: leaves(["Acre", "Cinzas", "Defumado", "Torra escura"]) },
        { name: "Cereais", children: leaves(["Grãos", "Malte"]) },
      ],
    },
    {
      name: "Especiarias",
      color: "#9c2f3a",
      children: [{ name: "Pungente" }, { name: "Pimenta" }, { name: "Especiarias escuras", children: leaves(["Anis", "Noz-moscada", "Canela", "Cravo"]) }],
    },
    {
      name: "Nozes / Cacau",
      color: "#7a4a2e",
      children: [
        { name: "Nozes", children: leaves(["Amendoim", "Avelã", "Amêndoa"]) },
        { name: "Cacau", children: leaves(["Chocolate", "Chocolate amargo"]) },
      ],
    },
    {
      name: "Doce",
      color: "#e2873a",
      children: [
        { name: "Açúcar mascavo", children: leaves(["Melaço", "Xarope de bordo", "Caramelizado", "Mel"]) },
        { name: "Baunilha" },
        { name: "Vanilina" },
        { name: "Doce geral" },
        { name: "Aromas doces" },
      ],
    },
  ],
};

/** Formulário clássico da SCA (cada atributo de 6 a 10, total de 100 pontos). */
export const cuppingAttributes = [
  { name: "Fragrância / Aroma", text: "O cheiro do pó seco e, depois, do café molhado ao quebrar a crosta." },
  { name: "Sabor", text: "A impressão combinada de gosto e aroma retronasal — a 'assinatura' do café." },
  { name: "Retrogosto", text: "Duração e qualidade do sabor que fica depois de engolir (ou cuspir)." },
  { name: "Acidez", text: "A vivacidade: cítrica, málica, fosfórica… brilhante quando boa, azeda quando ruim." },
  { name: "Corpo", text: "A sensação tátil na boca — da leveza do chá à densidade de um xarope." },
  { name: "Equilíbrio", text: "Como sabor, acidez, corpo e retrogosto se complementam." },
  { name: "Uniformidade", text: "Consistência entre as 5 xícaras da mesma amostra." },
  { name: "Xícara limpa", text: "Ausência de sabores estranhos do começo ao fim." },
  { name: "Doçura", text: "A plenitude agradável do sabor percebida como doce." },
  { name: "Nota global", text: "A avaliação integral e pessoal do provador." },
];

export const scoreBands = [
  { min: 90, max: 100, label: "Excepcional", text: "Raríssimo: cafés de concurso e leilões recordes." },
  { min: 85, max: 89.99, label: "Excelente", text: "Cafés especiais de alto nível, com personalidade marcante." },
  { min: 80, max: 84.99, label: "Muito bom", text: "A porta de entrada dos cafés especiais." },
  { min: 0, max: 79.99, label: "Abaixo de especial", text: "Cafés comerciais, de qualidade variável." },
];

export const cuppingProtocol = [
  { step: "Proporção", text: "8,25 g de café para 150 ml de água (≈ 1:18), em 5 xícaras por amostra." },
  { step: "Torra e moagem", text: "Torra clara-média (≈ Agtron 58–63), de 8 a 24 h antes; moagem um pouco mais grossa que a de filtro." },
  { step: "Fragrância", text: "Cheire o pó seco até 15 minutos após moer." },
  { step: "Infusão", text: "Água a ~93 °C até a borda; forma-se uma crosta de pó na superfície." },
  { step: "Quebra", text: "Entre 3 e 5 minutos, quebre a crosta com a colher e avalie o aroma." },
  { step: "Prova", text: "Retire a espuma; a partir de ~70 °C, sorva com força para espalhar o café pela boca e avalie conforme esfria." },
];
