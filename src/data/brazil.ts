/** Conab — Acompanhamento da Safra Brasileira de Café, 3º levantamento, safra 2026 (set/2026). */
export const conab2026 = {
  total: 67.606,
  arabica: 48.2,
  conilon: 19.4,
  change: 19.6,
  previous: 56.535,
  areaTotalHa: 2.35, // milhões de ha (produção + formação)
  areaProductionHa: 1.95,
  areaFormationHa: 0.402,
  productivity: 34.6,
  productivityArabica: 30.8,
  productivityConilon: 50.2,
};

export type StateRow = {
  uf: string;
  name: string;
  /** mil sacas */
  y2025: number;
  y2026: number;
  areaHa: number;
  productivity: number;
  type: string;
};

export const stateProduction: StateRow[] = [
  { uf: "MG", name: "Minas Gerais", y2025: 25755.1, y2026: 35594.6, areaHa: 1147529, productivity: 31.0, type: "Arábica (quase total)" },
  { uf: "ES", name: "Espírito Santo", y2025: 17448.0, y2026: 16507.0, areaHa: 396987, productivity: 41.6, type: "Conilon 12,1 mi · arábica 4,4 mi" },
  { uf: "SP", name: "São Paulo", y2025: 4739.9, y2026: 6192.0, areaHa: 200586, productivity: 30.9, type: "Arábica" },
  { uf: "BA", name: "Bahia", y2025: 4434.5, y2026: 4488.2, areaHa: 103550, productivity: 43.3, type: "Conilon 3,3 mi · arábica 1,2 mi" },
  { uf: "RO", name: "Rondônia", y2025: 2320.2, y2026: 2876.3, areaHa: 43155, productivity: 66.7, type: "Conilon / robustas amazônicos" },
  { uf: "PR", name: "Paraná", y2025: 748.6, y2026: 724.1, areaHa: 25106, productivity: 28.8, type: "Arábica" },
  { uf: "RJ", name: "Rio de Janeiro", y2025: 422.3, y2026: 423.3, areaHa: 12462, productivity: 34.0, type: "Arábica" },
  { uf: "GO", name: "Goiás", y2025: 215.5, y2026: 313.0, areaHa: 6159, productivity: 50.8, type: "Arábica (irrigado)" },
  { uf: "MT", name: "Mato Grosso", y2025: 278.7, y2026: 268.9, areaHa: 10300, productivity: 26.1, type: "Conilon clonal" },
  { uf: "AM", name: "Amazonas", y2025: 35.2, y2026: 46.9, areaHa: 1692, productivity: 27.7, type: "Conilon" },
];

/** Sub-regiões de Minas Gerais (Conab, mil sacas). */
export const mgRegions = [
  { name: "Sul e Centro-Oeste", y2025: 12061.3, y2026: 15932.6 },
  { name: "Zona da Mata, Rio Doce e Central", y2025: 8040.0, y2026: 9673.9 },
  { name: "Triângulo, Alto Paranaíba e Noroeste", y2025: 4771.6, y2026: 8899.6 },
  { name: "Norte, Jequitinhonha e Mucuri", y2025: 882.2, y2026: 1088.5 },
];

export type BrRegion = {
  id: string;
  name: string;
  uf: string;
  coords: [number, number]; // [lon, lat]
  species: "arábica" | "conilon" | "ambos";
  altitude: string;
  profile: string;
  gi?: string;
  text: string;
};

export const brRegions: BrRegion[] = [
  {
    id: "sul-de-minas",
    name: "Sul de Minas",
    uf: "MG",
    coords: [-45.43, -21.55],
    species: "arábica",
    altitude: "800–1.300 m",
    profile: "Chocolate, caramelo, castanhas; corpo médio e doçura.",
    text: "A maior região produtora do país, de relevo ondulado e pequenas e médias propriedades. Varginha, Três Pontas e Guaxupé são polos históricos.",
  },
  {
    id: "mantiqueira",
    name: "Mantiqueira de Minas",
    uf: "MG",
    coords: [-45.13, -22.12],
    species: "arábica",
    altitude: "900–1.500 m",
    profile: "Frutas amarelas e vermelhas, floral, acidez cítrica viva.",
    gi: "DO (2020) · IP desde 2011",
    text: "Serra íngreme de colheita manual, com Carmo de Minas como coração. Coleciona vitórias no Cup of Excellence Brasil.",
  },
  {
    id: "cerrado",
    name: "Cerrado Mineiro",
    uf: "MG",
    coords: [-46.99, -18.94],
    species: "arábica",
    altitude: "800–1.300 m",
    profile: "Chocolate, caramelo, acidez média e corpo encorpado.",
    gi: "DO (2013) · primeira DO de café do Brasil",
    text: "Chapadões planos de estações bem definidas — chuva no verão, seca na colheita —, ideais para mecanização e secagem natural.",
  },
  {
    id: "matas-de-minas",
    name: "Matas de Minas",
    uf: "MG",
    coords: [-42.03, -20.26],
    species: "arábica",
    altitude: "550–1.400 m",
    profile: "Doce, frutado, notas de mel e acidez equilibrada.",
    gi: "IP (2020)",
    text: "Montanhas da Zona da Mata ocupadas por agricultura familiar; colheita majoritariamente manual. Manhuaçu é o principal polo.",
  },
  {
    id: "caparao",
    name: "Caparaó",
    uf: "MG/ES",
    coords: [-41.85, -20.45],
    species: "arábica",
    altitude: "700–1.400 m",
    profile: "Floral, frutas vermelhas, doçura alta.",
    gi: "DO (2021)",
    text: "Encostas do Pico da Bandeira, na divisa entre Minas e Espírito Santo. Uma das regiões mais premiadas da última década.",
  },
  {
    id: "montanhas-es",
    name: "Montanhas do Espírito Santo",
    uf: "ES",
    coords: [-41.13, -20.33],
    species: "arábica",
    altitude: "500–1.200 m",
    profile: "Frutado, achocolatado, acidez média.",
    text: "Venda Nova do Imigrante e Domingos Martins: tradição de imigrantes italianos e alemães e muitos cafés especiais.",
  },
  {
    id: "conilon-es",
    name: "Conilon capixaba",
    uf: "ES",
    coords: [-40.39, -18.99],
    species: "conilon",
    altitude: "0–500 m",
    profile: "Corpo alto, cacau, cereais; crescem os conilons finos fermentados.",
    text: "O norte do Espírito Santo (Vila Valério, Jaguaré, São Mateus, Linhares) é o maior polo de conilon do Brasil.",
  },
  {
    id: "mogiana",
    name: "Alta Mogiana",
    uf: "SP",
    coords: [-47.4, -20.54],
    species: "arábica",
    altitude: "900–1.100 m",
    profile: "Chocolate, caramelo, nozes; corpo cremoso.",
    gi: "IP (2013)",
    text: "Planaltos ao redor de Franca, ligados à história das ferrovias paulistas e às fazendas do século XIX.",
  },
  {
    id: "pinhal",
    name: "Região de Pinhal",
    uf: "SP",
    coords: [-46.75, -22.19],
    species: "arábica",
    altitude: "850–1.300 m",
    profile: "Doce, achocolatado, frutas secas.",
    gi: "IP (2016)",
    text: "Espírito Santo do Pinhal e municípios vizinhos, na divisa com o Sul de Minas.",
  },
  {
    id: "norte-pioneiro",
    name: "Norte Pioneiro do Paraná",
    uf: "PR",
    coords: [-49.97, -23.16],
    species: "arábica",
    altitude: "450–1.000 m",
    profile: "Doce, corpo médio, notas de frutas maduras.",
    gi: "IP (2012)",
    text: "Herdeiro do ciclo cafeeiro paranaense, que encolheu após a geada negra de 1975, hoje focado em qualidade.",
  },
  {
    id: "chapada-diamantina",
    name: "Chapada Diamantina",
    uf: "BA",
    coords: [-41.77, -13.15],
    species: "arábica",
    altitude: "1.000–1.400 m",
    profile: "Floral, frutado, acidez brilhante — perfil 'de montanha'.",
    text: "Piatã e Ibicoara produzem alguns dos cafés mais pontuados do país em plena Bahia.",
  },
  {
    id: "oeste-bahia",
    name: "Oeste da Bahia",
    uf: "BA",
    coords: [-45.79, -12.09],
    species: "arábica",
    altitude: "700–1.000 m",
    profile: "Limpo, doce, corpo médio.",
    gi: "IP (2019)",
    text: "Cerrado irrigado por pivôs centrais, com produtividades entre as mais altas do mundo para arábica.",
  },
  {
    id: "atlantico-ba",
    name: "Atlântico Baiano",
    uf: "BA",
    coords: [-39.5, -16.4],
    species: "conilon",
    altitude: "0–300 m",
    profile: "Encorpado, cacau e cereais.",
    text: "Litoral sul e extremo sul da Bahia: cerca de 3,3 milhões de sacas de conilon em 2026 (Conab).",
  },
  {
    id: "rondonia",
    name: "Matas de Rondônia",
    uf: "RO",
    coords: [-61.45, -11.44],
    species: "conilon",
    altitude: "100–400 m",
    profile: "Robustas amazônicos: chocolate, especiarias, doçura surpreendente.",
    gi: "DO (2021)",
    text: "Híbridos clonais da Embrapa e cafeicultura familiar — inclusive indígena — elevaram a produtividade a 66,7 sacas/ha.",
  },
];

/** Cecafé — exportações do Brasil no ano civil de 2025. */
export const exports2025 = {
  bags: 40.049, // milhões
  revenueUsdBn: 15.586,
  changeVolume: -20.8,
  changeRevenue: 24.1,
  countries: 121,
  destinations: [
    { name: "Alemanha", bags: 5.409, share: 13.5 },
    { name: "Estados Unidos", bags: 5.381, share: 13.4 },
    { name: "Itália", bags: 3.149, share: 7.9 },
    { name: "Japão", bags: 2.647, share: 6.6 },
    { name: "Bélgica", bags: 2.321, share: 5.8 },
  ],
  ports: [
    { name: "Santos (SP)", share: 78.7 },
    { name: "Rio de Janeiro", share: 17.7 },
    { name: "Paranaguá (PR)", share: 0.9 },
    { name: "Outros", share: 2.7 },
  ],
};

/** ABIC — Indicadores da Indústria de Café 2025 (nov/2024–out/2025). */
export const consumptionBr = {
  bags: 21.409,
  change: -2.31,
  perCapitaRoasted: 4.82,
  perCapitaGreen: 6.02,
  cupsPerYear: 1400,
  industryRevenueBrlBn: 46.24,
  retailPrice5y: 116,
};

/** Fenologia do arábica no Sudeste (esquema de Camargo & Camargo, 2001; Embrapa). Meses 1–12. */
export const phenology = [
  { phase: "Florada", months: [9, 10, 11], text: "As primeiras chuvas após a seca disparam floradas sincronizadas: o cafezal fica branco e perfumado por 2 a 3 dias." },
  { phase: "Chumbinho", months: [10, 11, 12], text: "Os frutos recém-formados, pequenos e verdes, mal crescem nas primeiras semanas." },
  { phase: "Expansão", months: [12, 1, 2], text: "O fruto ganha volume rapidamente com as chuvas de verão. Seca aqui significa grãos pequenos." },
  { phase: "Granação", months: [1, 2, 3], text: "O endosperma se forma e enche a semente; é a fase de maior demanda por água e nutrientes." },
  { phase: "Maturação", months: [3, 4, 5], text: "Os frutos mudam de verde para cereja; açúcares e compostos de sabor se acumulam." },
  { phase: "Colheita", months: [5, 6, 7, 8, 9], text: "Da cereja ao seco na árvore: catação manual, derriça ou colhedoras mecânicas." },
  { phase: "Repouso", months: [7, 8], text: "Inverno seco: a planta reduz o crescimento e prepara as gemas florais da próxima safra." },
];
