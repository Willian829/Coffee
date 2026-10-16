export type Process = {
  id: string;
  name: string;
  aka: string;
  steps: { title: string; text: string }[];
  flavor: string;
  water: 1 | 2 | 3;
  risk: 1 | 2 | 3;
  time: string;
  where: string;
  color: "accent" | "gold" | "leaf" | "s2" | "s4";
};

export const processes: Process[] = [
  {
    id: "natural",
    name: "Natural",
    aka: "Via seca · cereja seca · 'dry process'",
    steps: [
      { title: "Separação", text: "No lavador, frutos boia (secos ou brocados) flutuam e são separados das cerejas, que afundam." },
      { title: "Secagem do fruto inteiro", text: "As cerejas secam com casca e polpa em terreiros ou camas suspensas, revolvidas várias vezes ao dia por 2 a 4 semanas." },
      { title: "Ponto de seca", text: "O fruto vira 'café em coco', com umidade de 11–12%." },
      { title: "Descanso", text: "Repousa em tulhas por 30 a 60 dias para estabilizar a umidade." },
      { title: "Beneficiamento", text: "A casca seca é removida mecanicamente, revelando o grão verde." },
    ],
    flavor: "Corpo alto, muita doçura, frutas maduras e notas vinosas; maior variabilidade.",
    water: 1,
    risk: 3,
    time: "15–30 dias de secagem",
    where: "Brasil, Etiópia, Iêmen, Vietnã",
    color: "accent",
  },
  {
    id: "lavado",
    name: "Lavado",
    aka: "Via úmida · 'washed' · despolpado e fermentado",
    steps: [
      { title: "Despolpa", text: "Um despolpador remove casca e polpa em poucas horas após a colheita." },
      { title: "Fermentação", text: "O café em pergaminho, ainda coberto de mucilagem, fica em tanques por 12 a 72 h; microrganismos degradam a mucilagem." },
      { title: "Lavagem", text: "Canais de água removem os restos de mucilagem; grãos mais densos são separados." },
      { title: "Secagem do pergaminho", text: "Em pátios, camas africanas ou secadores, até 10–12% de umidade." },
      { title: "Descascamento", text: "No beneficiamento, o pergaminho é retirado e o grão é classificado." },
    ],
    flavor: "Limpo, acidez brilhante e grande clareza de origem.",
    water: 3,
    risk: 1,
    time: "1–3 dias + 7–20 dias de secagem",
    where: "Colômbia, Quênia, América Central, Etiópia",
    color: "s2",
  },
  {
    id: "honey",
    name: "Honey / Cereja descascado",
    aka: "Pulped natural · 'CD' no Brasil · white, yellow, red e black honey",
    steps: [
      { title: "Despolpa", text: "A casca é retirada, mas parte ou toda a mucilagem doce permanece grudada ao pergaminho." },
      { title: "Escolha do 'mel'", text: "Quanto mais mucilagem e mais lenta a secagem, mais escuro o honey: do white (pouca) ao black (muita, secagem à sombra)." },
      { title: "Secagem", text: "Os grãos pegajosos secam em camas ou terreiros, revolvidos com frequência para evitar mofo." },
      { title: "Beneficiamento", text: "Retira-se o pergaminho seco e o grão segue para classificação." },
    ],
    flavor: "Doçura acentuada, corpo médio e acidez moderada — um meio-termo entre natural e lavado.",
    water: 2,
    risk: 2,
    time: "10–25 dias de secagem",
    where: "Costa Rica, El Salvador, Brasil (CD)",
    color: "gold",
  },
  {
    id: "giling",
    name: "Descascamento úmido",
    aka: "Giling basah · 'wet-hulled' · semi-lavado indonésio",
    steps: [
      { title: "Despolpa e fermentação curta", text: "O produtor despolpa e deixa fermentar por uma noite." },
      { title: "Pré-secagem", text: "O pergaminho seca só até 30–50% de umidade." },
      { title: "Descascamento úmido", text: "O pergaminho é removido com o grão ainda úmido e macio." },
      { title: "Secagem do grão nu", text: "O grão verde termina de secar exposto — e ganha a cor verde-azulada típica." },
    ],
    flavor: "Corpo denso, terroso, herbal, especiado e acidez baixa.",
    water: 2,
    risk: 2,
    time: "Poucos dias (adaptado ao clima úmido)",
    where: "Sumatra e Sulawesi (Indonésia)",
    color: "leaf",
  },
  {
    id: "anaerobico",
    name: "Fermentação anaeróbica",
    aka: "Fermentação controlada sem oxigênio",
    steps: [
      { title: "Tanque fechado", text: "Frutos inteiros ou despolpados vão para tanques ou bombonas vedados, com válvula para liberar CO₂." },
      { title: "Controle", text: "Tempo (de horas a dias), temperatura, pH e °Brix são monitorados." },
      { title: "Secagem", text: "Depois da fermentação, o café seca como natural ou honey." },
    ],
    flavor: "Intenso: frutas tropicais, vinho, especiarias, licor — às vezes polarizante.",
    water: 1,
    risk: 3,
    time: "24–200 h de fermentação",
    where: "Colômbia, Brasil, Costa Rica, Panamá",
    color: "s4",
  },
  {
    id: "carbonica",
    name: "Maceração carbônica",
    aka: "Inspirada no vinho Beaujolais",
    steps: [
      { title: "Saturação de CO₂", text: "Cerejas inteiras são colocadas em tanques e o oxigênio é expulso com gás carbônico." },
      { title: "Fermentação intracelular", text: "A fermentação começa dentro do próprio fruto, gerando ésteres aromáticos." },
      { title: "Secagem lenta", text: "O café é seco com cuidado para preservar os aromas." },
    ],
    flavor: "Muito aromático: frutas vermelhas, rosas, vinho tinto.",
    water: 1,
    risk: 3,
    time: "Dias de maceração",
    where: "Popularizada pelo barista Saša Šestić, campeão mundial de 2015",
    color: "accent",
  },
];

export const dryingMethods = [
  { name: "Terreiro", text: "Pátio de cimento, tijolo ou terra batida. Barato e escalável — o método mais comum no Brasil." },
  { name: "Cama africana (suspensa)", text: "Telas elevadas com circulação de ar por baixo; secagem mais uniforme e limpa. Padrão na Etiópia, no Quênia e em Ruanda." },
  { name: "Terreiro suspenso coberto", text: "Estufas ou coberturas plásticas protegem da chuva e permitem controlar a velocidade de secagem." },
  { name: "Secador mecânico", text: "Secadores rotativos ou de leito fixo; para preservar a qualidade, a massa de grãos não deve passar de ~40–45 °C." },
];

/** Classificação Oficial Brasileira (COB) — tipos por número de defeitos em amostra de 300 g. */
export const cobTypes = [
  { type: "Tipo 2", defects: 4 },
  { type: "Tipo 3", defects: 12 },
  { type: "Tipo 4", defects: 26 },
  { type: "Tipo 5", defects: 46 },
  { type: "Tipo 6", defects: 86 },
  { type: "Tipo 7", defects: 160 },
  { type: "Tipo 8", defects: 360 },
];

export const defects = [
  { name: "Preto", cause: "Fruto que fermentou demais ou caiu no chão", effect: "Sabor de terra, fenol, podre", primary: true },
  { name: "Ardido", cause: "Fermentação indesejada parcial", effect: "Azedo, avinagrado", primary: true },
  { name: "Verde", cause: "Fruto colhido imaturo", effect: "Adstringente, gramíneo", primary: false },
  { name: "Brocado", cause: "Ataque da broca-do-café", effect: "Sujo, mofado", primary: false },
  { name: "Concha", cause: "Malformação genética do grão", effect: "Torra desigual", primary: false },
  { name: "Mal granado", cause: "Seca ou deficiência nutricional na granação", effect: "Bebida rala", primary: false },
  { name: "Quaker", cause: "Grão imaturo que não escurece na torra", effect: "Cereal, papel, amendoim cru", primary: false },
  { name: "Matéria estranha", cause: "Pedras, paus e cascas", effect: "Risco ao moinho e à bebida", primary: true },
];

export const dryMill = [
  { name: "Pré-limpeza", text: "Ventiladores e peneiras retiram poeira, pedras e paus." },
  { name: "Descascamento", text: "Descascadores removem a casca seca (natural) ou o pergaminho (lavado, honey)." },
  { name: "Peneiras", text: "O tamanho é medido em 1/64 de polegada: peneira 17/18 é grão graúdo; o 'AA' queniano é 17–18." },
  { name: "Mesa densimétrica", text: "Vibração e ar separam os grãos por densidade — os mais densos costumam ser melhores." },
  { name: "Seleção óptica", text: "Câmeras e jatos de ar removem, um a um, grãos fora da cor padrão." },
  { name: "Ensaque", text: "Sacas de juta de 60 kg (69 kg na América Central, 70 kg na Colômbia) ou bags herméticos; um contêiner de 20 pés leva ~320 sacas." },
];
