/** Exigências climáticas aproximadas (Embrapa Café, FAO, World Coffee Research, Davis et al.). */
export const climate = {
  arabica: { tempMin: 18, tempMax: 23, tempLimitLow: 15, tempLimitHigh: 26, rainMin: 1200, rainMax: 1800, altMin: 600, altMax: 2200 },
  robusta: { tempMin: 22, tempMax: 28, tempLimitLow: 18.5, tempLimitHigh: 31, rainMin: 1200, rainMax: 2500, altMin: 0, altMax: 900 },
};

export const lifecycle = [
  { stage: "Semente", time: "dia 0", text: "Sementes selecionadas (ainda no pergaminho) são semeadas em sacolinhas ou tubetes no viveiro." },
  { stage: "Palito de fósforo", time: "≈ 6–8 semanas", text: "O caule emerge carregando a semente na ponta, como um palito de fósforo." },
  { stage: "Orelha de onça", time: "≈ 2–3 meses", text: "Os cotilédones se abrem em duas 'orelhinhas' arredondadas." },
  { stage: "Muda pronta", time: "6–8 meses", text: "Com 5 a 7 pares de folhas, a muda vai a campo no início das chuvas." },
  { stage: "Primeira safra", time: "2–3 anos", text: "As primeiras floradas aparecem; a produção ainda é pequena." },
  { stage: "Plena produção", time: "4–5 anos", text: "A planta entra em produção comercial, alternando safras altas e baixas (bienalidade)." },
  { stage: "Renovação", time: "15–30 anos", text: "Podas como recepa e esqueletamento renovam a lavoura; algumas plantas produzem por décadas." },
];

export const factors = [
  { title: "Altitude", text: "Em latitudes tropicais, cada 100 m a mais esfria o ar em ~0,6 °C. O amadurecimento lento em altitude concentra açúcares e ácidos — por isso arábicas de montanha são valorizados." },
  { title: "Latitude", text: "O 'Cinturão do Café' fica entre os trópicos de Câncer e Capricórnio. Mais longe do Equador — como no Brasil — a mesma qualidade é obtida em altitudes menores." },
  { title: "Chuva e seca", text: "O cafeeiro precisa de chuva bem distribuída na formação dos frutos e de um período seco que sincronize a florada e facilite a colheita." },
  { title: "Solo", text: "Profundo, bem drenado, rico em matéria orgânica e levemente ácido (pH 5–6). Solos vulcânicos são famosos, mas o Cerrado prova que manejo vale tanto quanto origem." },
  { title: "Sombra", text: "Em sistemas sombreados (agroflorestais), a maturação é mais lenta e há mais biodiversidade; a pleno sol, a produtividade tende a ser maior." },
  { title: "Densidade", text: "Do plantio tradicional (~2.500 plantas/ha) aos adensados (5.000–10.000/ha) com variedades compactas e mecanização." },
];

export const pests = [
  { name: "Ferrugem", sci: "Hemileia vastatrix", kind: "Fungo", text: "Manchas alaranjadas sob as folhas, queda prematura e perda de produção. Destruiu a cafeicultura do Ceilão no século XIX; em 2012–13 devastou a América Central." },
  { name: "Broca-do-café", sci: "Hypothenemus hampei", kind: "Inseto", text: "Besouro de 2 mm que perfura o fruto e se reproduz dentro da semente. É a praga mais danosa do café no mundo." },
  { name: "Bicho-mineiro", sci: "Leucoptera coffeella", kind: "Inseto", text: "Larva de mariposa que cava galerias nas folhas, reduzindo a fotossíntese — favorecida por clima seco e quente." },
  { name: "Antracnose dos frutos (CBD)", sci: "Colletotrichum kahawae", kind: "Fungo", text: "Ataca frutos verdes nas terras altas da África; motivou variedades resistentes como Ruiru 11 e Batian." },
  { name: "Cercosporiose", sci: "Cercospora coffeicola", kind: "Fungo", text: "Manchas em 'olho pardo' em folhas e frutos, associadas a desequilíbrio nutricional." },
  { name: "Nematoides", sci: "Meloidogyne spp.", kind: "Verme", text: "Atacam as raízes e enfraquecem a planta; combatidos com porta-enxertos de robusta resistentes." },
];

export const harvestMethods = [
  {
    id: "catacao",
    name: "Catação seletiva",
    aka: "Selective picking",
    text: "Só os frutos maduros são colhidos, um a um, com várias passadas pela mesma planta ao longo da safra.",
    pros: "Máxima qualidade e uniformidade",
    cons: "Cara e lenta: um colhedor apanha ~50–90 kg de frutos por dia",
    where: "Colômbia, América Central, Quênia, Etiópia, cafés especiais",
  },
  {
    id: "derrica-manual",
    name: "Derriça manual",
    aka: "Strip picking",
    text: "Todos os frutos do ramo são puxados de uma vez sobre panos estendidos no chão — verdes, maduros e secos juntos.",
    pros: "Rápida e barata",
    cons: "Mistura estágios de maturação; exige separação posterior",
    where: "Brasil, Vietnã, robustas em geral",
  },
  {
    id: "derricadeira",
    name: "Derriçadeira portátil",
    aka: "Semimecanizada",
    text: "Hastes vibratórias acopladas a um motor costal sacodem os ramos. Ideal em áreas montanhosas.",
    pros: "Multiplica a produtividade do colhedor",
    cons: "Pode ferir a planta se mal usada",
    where: "Montanhas de Minas, Espírito Santo, São Paulo",
  },
  {
    id: "mecanica",
    name: "Colhedora mecânica",
    aka: "Mechanical harvesting",
    text: "Máquinas que 'abraçam' a fileira e vibram os ramos com hastes. Exigem terreno com até ~15–20% de declive.",
    pros: "Uma máquina substitui dezenas de colhedores",
    cons: "Investimento alto; não seleciona maturação",
    where: "Cerrado Mineiro, Oeste da Bahia, Mogiana — a brasileira Jacto lançou a primeira colhedora em 1979",
  },
];

export const ripeness = [
  { name: "Verde", color: "#7f9a4a", text: "Imaturo: adstringente e gramíneo. Deve ficar na planta." },
  { name: "Verde-cana", color: "#b9b04a", text: "Quase maduro, amarelado; ainda falta doçura." },
  { name: "Cereja", color: "#c0392b", text: "O ponto ideal: polpa doce (18–24 °Brix) e semente completa." },
  { name: "Passa", color: "#7a2a2a", text: "Começando a secar na planta: doçura concentrada, bom para naturais." },
  { name: "Seco / boia", color: "#3b2418", text: "Seco no pé ou no chão: risco de defeitos fermentados e mofo." },
];
