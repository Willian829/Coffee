/**
 * Perfil de torra de referência (torrador de tambor, ~16 min): temperatura estimada do grão, partindo do ambiente.
 * Valores ilustrativos baseados em literatura de torra (SCA, Rao 2014, Schenker 2000).
 */
export const roastCurve: [number, number][] = [
  [0, 25],
  [0.5, 52],
  [1, 72],
  [1.6, 88],
  [2.5, 104],
  [3.5, 122],
  [4.5, 138],
  [5.5, 151],
  [6.5, 162],
  [7.5, 172],
  [8.5, 181],
  [9.5, 189],
  [10.3, 196],
  [11, 201],
  [11.8, 207],
  [12.6, 213],
  [13.4, 219],
  [14.2, 225],
  [15, 231],
  [15.8, 237],
  [16.5, 242],
];

export type RoastStage = {
  id: string;
  name: string;
  from: number; // temperatura do grão °C
  to: number;
  description: string;
  aroma: string;
};

export const roastStages: RoastStage[] = [
  { id: "carga", name: "Carga e aquecimento", from: 0, to: 100, description: "O grão verde, à temperatura ambiente, cai no tambor pré-aquecido (~200 °C) e começa a absorver calor. Nos torradores, a sonda registra uma queda inicial — o 'ponto de virada'.", aroma: "Nenhum (cheiro de grão cru)" },
  { id: "secagem", name: "Secagem", from: 100, to: 155, description: "A água do grão (10–12%) evapora. O verde dá lugar ao amarelo-palha.", aroma: "Feno, grama, pão cru" },
  { id: "maillard", name: "Reações de Maillard", from: 155, to: 196, description: "Açúcares redutores e aminoácidos reagem e formam melanoidinas (cor marrom) e centenas de aromas; a sacarose começa a caramelizar.", aroma: "Pão assado, torrada, caramelo" },
  { id: "crack1", name: "1º crack", from: 196, to: 205, description: "Vapor e CO₂ rompem a estrutura celular com estalos como de pipoca. O grão expande e perde a película.", aroma: "Caramelo, frutas, doce" },
  { id: "desenvolvimento", name: "Desenvolvimento", from: 205, to: 224, description: "Tempo após o 1º crack (15–25% do total): equilibra acidez, doçura e corpo.", aroma: "Chocolate, nozes, caramelo escuro" },
  { id: "crack2", name: "2º crack", from: 224, to: 234, description: "As paredes celulares se rompem; óleos migram para a superfície. Estalos mais finos, como arroz tufado.", aroma: "Cacau amargo, especiarias, defumado" },
  { id: "carbonizacao", name: "Carbonização", from: 234, to: 260, description: "Os sabores de origem desaparecem; amargor e notas queimadas dominam. Risco de fogo.", aroma: "Queimado, cinzas" },
];

export type RoastLevel = {
  agtron: number;
  name: string;
  aka: string;
  temp: string;
  color: string;
  notes: string;
  loss: string;
};

/** Escala Agtron/SCA (discos #95 a #25) — números maiores = torra mais clara. */
export const roastLevels: RoastLevel[] = [
  { agtron: 95, name: "Muito clara", aka: "Light / Cinnamon", temp: "≈196 °C", color: "#b98a57", notes: "Acidez alta, chá, cereais; pode ficar verde e adstringente.", loss: "≈11%" },
  { agtron: 85, name: "Clara", aka: "New England", temp: "≈200 °C", color: "#a87645", notes: "Floral e cítrico; ideal para coados de cafés muito delicados.", loss: "≈12%" },
  { agtron: 75, name: "Clara-média", aka: "City", temp: "≈205 °C", color: "#946338", notes: "Frutado, doce, acidez vibrante — a preferida dos cafés especiais.", loss: "≈13%" },
  { agtron: 65, name: "Média", aka: "City+ / American", temp: "≈210 °C", color: "#7b4e2b", notes: "Equilíbrio entre acidez, doçura e corpo; caramelo.", loss: "≈14%" },
  { agtron: 55, name: "Média-escura", aka: "Full City", temp: "≈218 °C", color: "#633c20", notes: "Chocolate, nozes, corpo encorpado; ótima para espresso.", loss: "≈16%" },
  { agtron: 45, name: "Escura", aka: "Vienna", temp: "≈225 °C", color: "#4a2b17", notes: "Início do 2º crack: amargor agradável, cacau e especiarias.", loss: "≈17%" },
  { agtron: 35, name: "Muito escura", aka: "French", temp: "≈232 °C", color: "#331d10", notes: "Óleo na superfície, defumado, corpo mais leve.", loss: "≈19%" },
  { agtron: 25, name: "Extremamente escura", aka: "Italian / Spanish", temp: "≈240 °C", color: "#21130b", notes: "Queimado, cinzas — pouco resta da origem.", loss: "≥20%" },
];

/** Cores do grão em função da temperatura (interpoladas no simulador). */
export const beanColorStops: [number, string][] = [
  [20, "#8f9a5c"],
  [100, "#9aa063"],
  [140, "#c8b46e"],
  [160, "#c79a5a"],
  [180, "#ad7a45"],
  [196, "#93633a"],
  [205, "#7e512e"],
  [215, "#653e22"],
  [225, "#4c2c17"],
  [235, "#33200f"],
  [245, "#1d120a"],
];

export const roastChemistry = [
  { title: "Perda de peso", text: "O grão perde 12–20% do peso (principalmente água) e quase dobra de volume." },
  { title: "Ácidos clorogênicos", text: "Principais antioxidantes do grão verde; degradam-se com a torra — torras escuras têm bem menos." },
  { title: "Cafeína", text: "É bastante estável ao calor. Por grão, a diferença entre torras é pequena; por colher (volume), a torra clara tem um pouco mais." },
  { title: "Sacarose", text: "Praticamente toda a sacarose é consumida até a torra média, virando caramelo, ácidos e aromas." },
  { title: "CO₂ e descanso", text: "O grão torrado libera gás carbônico por dias; espere de 3 a 14 dias para extrair o melhor sabor (a válvula da embalagem deixa o gás sair)." },
  { title: "Trigonelina", text: "Degrada-se em niacina (vitamina B3) e em compostos aromáticos como as piridinas." },
];
