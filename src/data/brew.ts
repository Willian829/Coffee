export type BrewStep = { at: number; label: string; detail: string; pourTo?: number };

export type BrewMethod = {
  id: string;
  name: string;
  family: "pressão" | "filtrado" | "imersão" | "fervura" | "frio";
  ratio: number; // gramas de água por grama de café
  ratioRange: string;
  grind: string;
  grindLevel: number; // 1 (extra fina) … 7 (extra grossa)
  temp: string;
  time: string;
  dose: number; // dose base em gramas (1 porção)
  serving: number; // ml por porção
  body: number; // 1–5
  clarity: number; // 1–5
  difficulty: number; // 1–5
  description: string;
  tips: string[];
  steps?: (coffee: number, water: number) => BrewStep[];
};

const pourOver = (coffee: number, water: number, total: number): BrewStep[] => {
  const bloom = Math.round(coffee * 2.5);
  const second = Math.round(water * 0.6);
  return [
    { at: 0, label: "Pré-infusão (bloom)", detail: `Despeje ${bloom} g de água em espiral para molhar todo o pó e liberar o CO₂.`, pourTo: bloom },
    { at: 40, label: "Segundo despejo", detail: `Despeje devagar, do centro para fora, até ${second} g.`, pourTo: second },
    { at: 75, label: "Despejo final", detail: `Complete até ${water} g mantendo o nível da água constante.`, pourTo: water },
    { at: Math.max(110, total - 60), label: "Drenagem", detail: "Gire suavemente o filtro para nivelar a cama de café e deixe escoar." },
    { at: total, label: "Pronto", detail: "Retire o filtro, mexa a jarra e sirva. Prove como o sabor muda ao esfriar." },
  ];
};

export const brewMethods: BrewMethod[] = [
  {
    id: "espresso",
    name: "Espresso",
    family: "pressão",
    ratio: 2,
    ratioRange: "1:1,5 a 1:2,5",
    grind: "Fina",
    grindLevel: 2,
    temp: "90–94 °C",
    time: "25–32 s",
    dose: 18,
    serving: 40,
    body: 5,
    clarity: 2,
    difficulty: 5,
    description: "Água a ~9 bar atravessa uma pastilha compactada de café: extração rápida, concentrada, com crema.",
    tips: ["Distribua e compacte de forma nivelada.", "Ajuste a moagem antes de mexer na dose.", "Amargo demais? Moa mais grosso ou reduza o tempo. Ácido e ralo? Moa mais fino."],
    steps: (c, w) => [
      { at: 0, label: "Extração", detail: `Inicie a extração com ${c} g de café na cesta.` },
      { at: 8, label: "Primeiras gotas", detail: "O fluxo deve começar escuro e espesso, como mel." },
      { at: 22, label: "Atenção à cor", detail: "Quando o fluxo clarear (\"blonding\"), você está perto do fim." },
      { at: 28, label: "Pare", detail: `Pare ao atingir ~${w} g de bebida na xícara.` },
    ],
  },
  {
    id: "v60",
    name: "Hario V60",
    family: "filtrado",
    ratio: 16,
    ratioRange: "1:15 a 1:17",
    grind: "Média-fina",
    grindLevel: 4,
    temp: "92–96 °C",
    time: "2:30–3:30",
    dose: 15,
    serving: 240,
    body: 2,
    clarity: 5,
    difficulty: 3,
    description: "Cone de 60° com espirais: o fluxo depende do despejo, e o resultado é limpo, aromático e brilhante.",
    tips: ["Escalde o filtro de papel para tirar o gosto e aquecer o cone.", "Use chaleira de bico fino para controlar o fluxo.", "Tempo longo demais indica moagem fina demais."],
    steps: (c, w) => pourOver(c, w, 180),
  },
  {
    id: "coado",
    name: "Coado (pano ou papel)",
    family: "filtrado",
    ratio: 12.5,
    ratioRange: "1:12 a 1:15 (≈ 80 g/L)",
    grind: "Média",
    grindLevel: 4,
    temp: "90–95 °C (não ferva!)",
    time: "3–4 min",
    dose: 20,
    serving: 250,
    body: 3,
    clarity: 3,
    difficulty: 1,
    description: "O jeito brasileiro: filtro de pano (o 'coador') ou de papel, com café mais concentrado — o cafezinho.",
    tips: ["Desligue a água ao surgirem as primeiras bolhas — água fervente amarga o café.", "Não ferva o pó junto com a água.", "Guarde o coador de pano limpo, úmido e na geladeira."],
    steps: (c, w) => pourOver(c, w, 210),
  },
  {
    id: "chemex",
    name: "Chemex",
    family: "filtrado",
    ratio: 16,
    ratioRange: "1:15 a 1:17",
    grind: "Média-grossa",
    grindLevel: 5,
    temp: "93–96 °C",
    time: "4–5 min",
    dose: 30,
    serving: 480,
    body: 1,
    clarity: 5,
    difficulty: 3,
    description: "Criada em 1941 pelo químico Peter Schlumbohm. O filtro espesso retém óleos e partículas: xícara muito limpa.",
    tips: ["A face tripla do filtro fica do lado do bico.", "Moagem mais grossa que a do V60 por causa do filtro denso.", "Ótima para servir várias pessoas."],
    steps: (c, w) => pourOver(c, w, 270),
  },
  {
    id: "prensa",
    name: "Prensa francesa",
    family: "imersão",
    ratio: 15,
    ratioRange: "1:12 a 1:16",
    grind: "Grossa",
    grindLevel: 6,
    temp: "93–96 °C",
    time: "4 min + descanso",
    dose: 20,
    serving: 300,
    body: 5,
    clarity: 2,
    difficulty: 1,
    description: "Imersão total com filtro de metal: os óleos passam, e o resultado é encorpado e aveludado.",
    tips: ["Quebre a crosta aos 4 min e retire a espuma com colheres.", "Espere mais 3–5 min antes de pressionar só até a superfície.", "Sirva tudo logo para não superextrair."],
    steps: (c, w) => [
      { at: 0, label: "Infusão", detail: `Despeje ${w} g de água sobre ${c} g de café, molhando todo o pó.`, pourTo: w },
      { at: 240, label: "Quebre a crosta", detail: "Mexa a superfície e retire a espuma e as partículas flutuantes." },
      { at: 420, label: "Pressione e sirva", detail: "Abaixe o êmbolo só até a superfície e sirva devagar." },
    ],
  },
  {
    id: "aeropress",
    name: "AeroPress",
    family: "pressão",
    ratio: 14,
    ratioRange: "1:11 a 1:16",
    grind: "Média-fina",
    grindLevel: 3,
    temp: "80–95 °C",
    time: "1:30–2:30",
    dose: 15,
    serving: 200,
    body: 3,
    clarity: 4,
    difficulty: 2,
    description: "Imersão curta com pressão manual e filtro de papel. Versátil: tem até campeonato mundial de receitas.",
    tips: ["Método invertido evita gotejamento precoce.", "Temperaturas mais baixas suavizam torras escuras.", "Pressione devagar, por ~30 s."],
    steps: (c, w) => [
      { at: 0, label: "Água", detail: `Adicione ${w} g de água sobre ${c} g de café.`, pourTo: w },
      { at: 10, label: "Mexa", detail: "Mexa 3 a 5 vezes e encaixe o êmbolo para criar vácuo." },
      { at: 75, label: "Gire e pressione", detail: "Gire suavemente e pressione por ~30 segundos." },
      { at: 105, label: "Pronto", detail: "Pare quando ouvir o chiado do ar." },
    ],
  },
  {
    id: "moka",
    name: "Moka (cafeteira italiana)",
    family: "pressão",
    ratio: 7,
    ratioRange: "≈ 1:7",
    grind: "Fina-média",
    grindLevel: 3,
    temp: "Fogo médio-baixo",
    time: "4–5 min",
    dose: 15,
    serving: 100,
    body: 4,
    clarity: 2,
    difficulty: 2,
    description: "Inventada por Alfonso Bialetti em 1933: o vapor empurra a água pelo café a ~1–2 bar.",
    tips: ["Use água pré-aquecida na base para não 'cozinhar' o pó.", "Não compacte o café no funil.", "Retire do fogo assim que o café começar a borbulhar."],
  },
  {
    id: "turco",
    name: "Café turco (cezve)",
    family: "fervura",
    ratio: 10,
    ratioRange: "≈ 1:10",
    grind: "Extra fina (pó)",
    grindLevel: 1,
    temp: "Aquecer até quase ferver",
    time: "2–3 min",
    dose: 7,
    serving: 70,
    body: 5,
    clarity: 1,
    difficulty: 2,
    description: "Café, água fria e açúcar (opcional) aquecidos juntos num cezve; servido sem filtrar, com a borra no fundo.",
    tips: ["Aqueça devagar até a espuma subir — sem deixar ferver.", "Distribua a espuma entre as xícaras.", "Espere a borra assentar antes de beber."],
  },
  {
    id: "coldbrew",
    name: "Cold brew",
    family: "frio",
    ratio: 8,
    ratioRange: "1:5 a 1:8 (concentrado)",
    grind: "Grossa",
    grindLevel: 7,
    temp: "Água fria ou ambiente",
    time: "12–24 h",
    dose: 100,
    serving: 800,
    body: 4,
    clarity: 3,
    difficulty: 1,
    description: "Extração lenta a frio: menos acidez percebida, doçura e notas de chocolate. Dilua o concentrado 1:1.",
    tips: ["Deixe na geladeira por 16–18 h.", "Filtre duas vezes (metal e papel).", "Dura até 2 semanas refrigerado."],
  },
  {
    id: "sifao",
    name: "Sifão (vácuo)",
    family: "imersão",
    ratio: 15,
    ratioRange: "1:14 a 1:16",
    grind: "Média",
    grindLevel: 4,
    temp: "≈ 92 °C",
    time: "1–1:30 de infusão",
    dose: 20,
    serving: 300,
    body: 3,
    clarity: 4,
    difficulty: 4,
    description: "Patenteado no século XIX: o vapor sobe a água para o balão superior; ao apagar o fogo, o vácuo puxa o café filtrado.",
    tips: ["Mexa suavemente ao adicionar o café.", "Desligue a fonte de calor para iniciar o vácuo.", "Ótimo espetáculo para visitas."],
  },
];

/** Escala de moagem (aproximada, em micrômetros). */
export const grindScale = [
  { level: 1, name: "Extra fina", microns: "100–200 µm", example: "Café turco", like: "farinha de trigo" },
  { level: 2, name: "Fina", microns: "200–400 µm", example: "Espresso", like: "sal refinado" },
  { level: 3, name: "Fina-média", microns: "400–600 µm", example: "Moka, AeroPress", like: "areia fina" },
  { level: 4, name: "Média", microns: "600–900 µm", example: "V60, coado, sifão", like: "areia de praia" },
  { level: 5, name: "Média-grossa", microns: "800–1.000 µm", example: "Chemex, Clever", like: "sal grosso miúdo" },
  { level: 6, name: "Grossa", microns: "1.000–1.400 µm", example: "Prensa francesa", like: "sal grosso" },
  { level: 7, name: "Extra grossa", microns: "1.200–1.600 µm", example: "Cold brew", like: "pimenta quebrada" },
];

/** Padrão de água para café — SCA Water Quality Handbook. */
export const waterStandard = [
  { name: "Sólidos dissolvidos (TDS)", target: "150 mg/L", range: "75–250 mg/L" },
  { name: "Dureza cálcica", target: "68 mg/L CaCO₃", range: "17–85 mg/L" },
  { name: "Alcalinidade total", target: "40 mg/L", range: "≈ 40 mg/L" },
  { name: "pH", target: "7,0", range: "6,5–7,5" },
  { name: "Sódio", target: "10 mg/L", range: "< 30 mg/L" },
  { name: "Cloro", target: "0", range: "sem cloro, sem odor" },
];

export type Drink = {
  id: string;
  name: string;
  origin: string;
  volume: string;
  description: string;
  layers: { kind: "espresso" | "milk" | "foam" | "water" | "chocolate" | "cream" | "icecream" | "whiskey" | "coffee" | "condensed" | "ice"; h: number }[];
};

/** Proporções aproximadas das camadas (alturas relativas). */
export const drinks: Drink[] = [
  { id: "espresso", name: "Espresso", origin: "Itália", volume: "25–40 ml", description: "A base de tudo: concentrado, com crema.", layers: [{ kind: "espresso", h: 1 }] },
  { id: "ristretto", name: "Ristretto", origin: "Itália", volume: "15–20 ml", description: "Espresso 'restrito': menos água, mais doce e intenso.", layers: [{ kind: "espresso", h: 0.6 }] },
  { id: "lungo", name: "Lungo", origin: "Itália", volume: "60–90 ml", description: "Espresso 'longo': mais água passa pelo café.", layers: [{ kind: "espresso", h: 2 }] },
  { id: "americano", name: "Americano", origin: "Itália / EUA", volume: "150–250 ml", description: "Espresso diluído em água quente.", layers: [{ kind: "espresso", h: 1 }, { kind: "water", h: 3 }] },
  { id: "macchiato", name: "Macchiato", origin: "Itália", volume: "40–60 ml", description: "Espresso 'manchado' com um pouco de espuma de leite.", layers: [{ kind: "espresso", h: 1 }, { kind: "foam", h: 0.6 }] },
  { id: "cortado", name: "Cortado", origin: "Espanha", volume: "60–90 ml", description: "Espresso e leite vaporizado em partes iguais.", layers: [{ kind: "espresso", h: 1 }, { kind: "milk", h: 1 }, { kind: "foam", h: 0.2 }] },
  { id: "pingado", name: "Pingado", origin: "Brasil", volume: "≈ 100 ml", description: "Café coado com um 'pingo' de leite — clássico de padaria.", layers: [{ kind: "coffee", h: 2.2 }, { kind: "milk", h: 0.5 }] },
  { id: "cappuccino", name: "Cappuccino", origin: "Itália", volume: "150–180 ml", description: "Um terço espresso, um terço leite, um terço espuma.", layers: [{ kind: "espresso", h: 1 }, { kind: "milk", h: 1 }, { kind: "foam", h: 1.2 }] },
  { id: "flatwhite", name: "Flat white", origin: "Austrália / Nova Zelândia", volume: "150–170 ml", description: "Dose dupla com leite vaporizado e microespuma fininha.", layers: [{ kind: "espresso", h: 1.3 }, { kind: "milk", h: 1.6 }, { kind: "foam", h: 0.3 }] },
  { id: "latte", name: "Latte", origin: "Itália / EUA", volume: "240–350 ml", description: "Espresso com muito leite vaporizado e uma camada fina de espuma.", layers: [{ kind: "espresso", h: 1 }, { kind: "milk", h: 2.6 }, { kind: "foam", h: 0.5 }] },
  { id: "mocha", name: "Mocha", origin: "EUA", volume: "240–300 ml", description: "Latte com chocolate e, muitas vezes, chantilly.", layers: [{ kind: "chocolate", h: 0.6 }, { kind: "espresso", h: 1 }, { kind: "milk", h: 1.6 }, { kind: "cream", h: 0.8 }] },
  { id: "suada", name: "Cà phê sữa đá", origin: "Vietnã", volume: "≈ 200 ml", description: "Café forte no filtro phin sobre leite condensado e gelo.", layers: [{ kind: "condensed", h: 0.8 }, { kind: "coffee", h: 1.4 }, { kind: "ice", h: 1.4 }] },
  { id: "affogato", name: "Affogato", origin: "Itália", volume: "≈ 100 ml", description: "Uma bola de sorvete 'afogada' em espresso.", layers: [{ kind: "espresso", h: 0.8 }, { kind: "icecream", h: 1.6 }] },
  { id: "irish", name: "Irish coffee", origin: "Irlanda (1943)", volume: "≈ 200 ml", description: "Uísque irlandês, açúcar mascavo, café quente e creme batido por cima.", layers: [{ kind: "whiskey", h: 0.8 }, { kind: "coffee", h: 1.8 }, { kind: "cream", h: 0.9 }] },
];

export const goldenCup = {
  ratio: "55 g/L ± 10% (≈ 1:18)",
  extraction: "18–22%",
  tds: "1,15–1,35%",
  temp: "92–96 °C",
};
