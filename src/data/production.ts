/**
 * USDA Foreign Agricultural Service — "Coffee: World Markets and Trade", julho de 2026.
 * Valores em milhares de sacas de 60 kg (café verde equivalente).
 * Anos-safra: 2021/22 … 2026/27 (2026/27 = previsão).
 */
export const marketYears = ["2021/22", "2022/23", "2023/24", "2024/25", "2025/26", "2026/27"] as const;
export type MarketYear = (typeof marketYears)[number];

type Series = [number, number, number, number, number, number];

/** ISO 3166-1 numérico (compatível com world-atlas) */
export type Row = { iso: string; name: string; values: Series };

export const productionTotal: Row[] = [
  { iso: "076", name: "Brasil", values: [58100, 62600, 66300, 65500, 63000, 71900] },
  { iso: "704", name: "Vietnã", values: [31580, 28300, 27550, 29000, 31700, 32500] },
  { iso: "170", name: "Colômbia", values: [11800, 10700, 12760, 14800, 12500, 13400] },
  { iso: "231", name: "Etiópia", values: [8150, 7300, 9130, 11460, 11560, 12100] },
  { iso: "360", name: "Indonésia", values: [10580, 10700, 8150, 10700, 12370, 11380] },
  { iso: "800", name: "Uganda", values: [6050, 6565, 6400, 6700, 7095, 7160] },
  { iso: "356", name: "Índia", values: [5700, 5867, 6560, 6059, 6430, 6140] },
  { iso: "340", name: "Honduras", values: [4800, 5700, 5050, 5200, 5530, 6030] },
  { iso: "604", name: "Peru", values: [4200, 3475, 3912, 4120, 4764, 4780] },
  { iso: "484", name: "México", values: [3740, 3545, 3856, 3928, 4080, 4135] },
  { iso: "320", name: "Guatemala", values: [3540, 3270, 3469, 3270, 3155, 3260] },
  { iso: "558", name: "Nicarágua", values: [2838, 2590, 2347, 2660, 2560, 2440] },
  { iso: "156", name: "China", values: [1800, 1800, 1800, 1900, 1900, 1900] },
  { iso: "834", name: "Tanzânia", values: [1200, 1200, 1350, 1350, 1450, 1600] },
  { iso: "458", name: "Malásia", values: [2000, 2000, 1330, 1400, 1500, 1500] },
  { iso: "384", name: "Costa do Marfim", values: [1110, 1020, 1325, 650, 1300, 1300] },
  { iso: "188", name: "Costa Rica", values: [1215, 1100, 1158, 1315, 1160, 1200] },
  { iso: "404", name: "Quênia", values: [860, 750, 825, 950, 850, 950] },
  { iso: "764", name: "Tailândia", values: [650, 700, 750, 900, 900, 900] },
  { iso: "598", name: "Papua-Nova Guiné", values: [775, 875, 980, 790, 800, 800] },
  { iso: "222", name: "El Salvador", values: [600, 550, 604, 581, 586, 542] },
  { iso: "418", name: "Laos", values: [385, 410, 410, 450, 475, 500] },
  { iso: "862", name: "Venezuela", values: [500, 500, 500, 500, 500, 500] },
  { iso: "608", name: "Filipinas", values: [450, 475, 450, 450, 450, 475] },
  { iso: "218", name: "Equador", values: [260, 354, 370, 355, 350, 350] },
];

export const productionOther: Series = [2161, 2183, 1999, 1828, 1865, 1925];
export const worldProduction: Series = [165044, 164529, 169335, 176816, 178830, 189667];
export const worldArabica: Series = [87089, 87908, 97160, 102276, 94440, 105867];
export const worldRobusta: Series = [77955, 76621, 72175, 74540, 84390, 83800];

/** Arábica e robusta por país (países listados pela USDA). */
export const arabicaByCountry: Record<string, Series> = {
  "076": [36400, 39800, 44900, 44500, 38000, 47500],
  "170": [11800, 10700, 12760, 14800, 12500, 13400],
  "231": [8150, 7300, 9130, 11460, 11560, 12100],
  "340": [4800, 5700, 5050, 5200, 5530, 6030],
  "604": [4200, 3475, 3912, 4120, 4764, 4780],
  "484": [3200, 3000, 3356, 3588, 3580, 3575],
  "320": [3410, 3150, 3339, 3140, 3025, 3130],
  "558": [2718, 2430, 2187, 2500, 2400, 2300],
  "156": [1800, 1800, 1800, 1900, 1900, 1900],
  "356": [1583, 1667, 1480, 1762, 1730, 1560],
  "360": [1280, 1200, 1350, 1400, 1370, 1380],
  "188": [1215, 1100, 1158, 1315, 1160, 1200],
  "800": [990, 990, 1000, 1030, 1120, 1135],
  "704": [1100, 1000, 1000, 1000, 1200, 1100],
  "404": [860, 750, 825, 950, 850, 950],
};
export const robustaByCountry: Record<string, Series> = {
  "704": [30480, 27300, 26550, 28000, 30500, 31400],
  "076": [21700, 22800, 21400, 21000, 25000, 24400],
  "360": [9300, 9500, 6800, 9300, 11000, 10000],
  "800": [5060, 5575, 5400, 5670, 5975, 6025],
  "356": [4117, 4200, 5080, 4297, 4700, 4580],
  "458": [2000, 2000, 1330, 1400, 1500, 1500],
  "384": [1110, 1020, 1325, 650, 1300, 1300],
  "764": [650, 700, 750, 900, 900, 900],
  "834": [550, 550, 600, 650, 700, 750],
  "484": [540, 545, 500, 340, 500, 560],
};

/** Exportações de café em grão (verde). */
export const beanExports: Row[] = [
  { iso: "076", name: "Brasil", values: [35576, 32200, 43100, 41000, 34000, 45000] },
  { iso: "704", name: "Vietnã", values: [26110, 26000, 22000, 22350, 25100, 25400] },
  { iso: "170", name: "Colômbia", values: [11000, 9450, 10700, 12200, 11700, 12200] },
  { iso: "231", name: "Etiópia", values: [4831, 3910, 5605, 7410, 6940, 7100] },
  { iso: "360", name: "Indonésia", values: [6335, 6735, 4285, 6135, 7844, 7000] },
  { iso: "800", name: "Uganda", values: [5850, 6250, 6300, 6350, 6700, 6830] },
  { iso: "340", name: "Honduras", values: [4650, 5310, 4715, 4958, 5028, 5500] },
  { iso: "604", name: "Peru", values: [4065, 3325, 3935, 3620, 4238, 4250] },
  { iso: "356", name: "Índia", values: [4937, 3924, 4360, 3613, 3600, 3680] },
  { iso: "320", name: "Guatemala", values: [3335, 3000, 3151, 2860, 2800, 2880] },
];
export const worldBeanExports: Series = [118953, 111080, 119189, 121805, 119538, 131410];

/** Importações de café em grão. */
export const beanImports: Row[] = [
  { iso: "EU", name: "União Europeia", values: [46615, 44515, 43990, 46230, 46500, 50000] },
  { iso: "840", name: "Estados Unidos", values: [25225, 22540, 21475, 23360, 23100, 24500] },
  { iso: "392", name: "Japão", values: [6800, 5860, 6220, 5815, 5800, 6200] },
  { iso: "156", name: "China", values: [1660, 1965, 3405, 3320, 3700, 4000] },
  { iso: "643", name: "Rússia", values: [3400, 3500, 3500, 3700, 3800, 4000] },
  { iso: "756", name: "Suíça", values: [3400, 3290, 3345, 3540, 3500, 3700] },
  { iso: "124", name: "Canadá", values: [2940, 2700, 2980, 3190, 3000, 3200] },
  { iso: "410", name: "Coreia do Sul", values: [3015, 2820, 2960, 2985, 2800, 3000] },
  { iso: "826", name: "Reino Unido", values: [2725, 2285, 2450, 2385, 2400, 2600] },
  { iso: "484", name: "México", values: [1811, 1723, 1471, 2040, 2030, 2100] },
];

/** Consumo doméstico. */
export const consumption: Row[] = [
  { iso: "EU", name: "União Europeia", values: [41890, 44497, 39613, 41236, 41570, 42500] },
  { iso: "840", name: "Estados Unidos", values: [26708, 24623, 23545, 26145, 25550, 26950] },
  { iso: "076", name: "Brasil", values: [22340, 22450, 22160, 21970, 22280, 22390] },
  { iso: "392", name: "Japão", values: [7210, 6886, 6996, 6528, 6653, 6900] },
  { iso: "156", name: "China", values: [4920, 5280, 5765, 5893, 6420, 6750] },
  { iso: "608", name: "Filipinas", values: [7190, 6465, 6590, 6190, 6525, 6725] },
  { iso: "124", name: "Canadá", values: [5330, 5110, 4980, 5085, 5050, 5100] },
  { iso: "231", name: "Etiópia", values: [3364, 3430, 3500, 4000, 4500, 5000] },
  { iso: "704", name: "Vietnã", values: [3200, 3200, 3900, 4800, 4900, 5000] },
  { iso: "826", name: "Reino Unido", values: [3985, 3980, 4190, 4495, 4570, 4850] },
  { iso: "360", name: "Indonésia", values: [4750, 4771, 4775, 4873, 4810, 4830] },
  { iso: "643", name: "Rússia", values: [4055, 4250, 4250, 4450, 4575, 4800] },
  { iso: "410", name: "Coreia do Sul", values: [3405, 3175, 3350, 3365, 3200, 3400] },
  { iso: "484", name: "México", values: [2850, 3035, 3100, 3100, 3160, 3240] },
  { iso: "036", name: "Austrália", values: [2305, 2135, 2090, 2740, 2535, 2650] },
  { iso: "170", name: "Colômbia", values: [2145, 2150, 2225, 2149, 2200, 2200] },
  { iso: "012", name: "Argélia", values: [2090, 2050, 1950, 2050, 2050, 2050] },
  { iso: "792", name: "Turquia", values: [1285, 1590, 1545, 1820, 1750, 1925] },
  { iso: "356", name: "Índia", values: [875, 900, 1250, 1150, 1575, 1580] },
  { iso: "682", name: "Arábia Saudita", values: [1140, 1380, 1375, 1540, 1350, 1450] },
  { iso: "756", name: "Suíça", values: [1185, 1160, 1094, 1215, 1200, 1300] },
  { iso: "818", name: "Egito", values: [450, 900, 650, 1175, 1175, 1275] },
  { iso: "804", name: "Ucrânia", values: [1300, 1090, 1100, 1070, 1110, 1150] },
  { iso: "764", name: "Tailândia", values: [725, 730, 880, 930, 925, 1125] },
  { iso: "504", name: "Marrocos", values: [990, 805, 840, 960, 910, 950] },
];
export const worldConsumption: Series = [167876, 168754, 163944, 171761, 173459, 179736];
export const worldEndingStocks: Series = [31940, 26934, 23121, 22010, 24370, 26283];

/**
 * População estimada em 2025 (milhões) — ONU, World Population Prospects 2024;
 * UE: Eurostat (1º jan. 2025); Brasil: IBGE (estimativa 2025).
 * Usada apenas para estimar o consumo per capita (kg de café verde/pessoa/ano).
 */
export const population2025: Record<string, number> = {
  EU: 450.4,
  "840": 347.3,
  "076": 213.4,
  "392": 123.1,
  "156": 1416.1,
  "608": 116.8,
  "124": 41.5,
  "231": 135.5,
  "704": 101.6,
  "826": 69.6,
  "360": 285.7,
  "643": 144.0,
  "410": 51.7,
  "484": 131.9,
  "036": 27.0,
  "170": 53.4,
  "012": 47.4,
  "792": 87.7,
  "356": 1463.9,
  "682": 34.6,
  "756": 9.0,
  "818": 118.4,
  "804": 38.9,
  "764": 71.6,
  "504": 38.4,
};

/** Membros da União Europeia (ISO numérico) — usados para pintar o bloco no mapa. */
export const euMembers = [
  "040", "056", "100", "191", "196", "203", "208", "233", "246", "250", "276", "300", "348", "372",
  "380", "428", "440", "442", "470", "528", "616", "620", "642", "703", "705", "724", "752",
];

/** ICO — Coffee Market Report, setembro de 2026 (Tabela 3). Milhões de sacas, ano-cafeeiro out–set. */
export const icoBalance = {
  years: ["2020/21", "2021/22", "2022/23", "2023/24", "2024/25", "2025/26"],
  production: [171.3, 168.4, 170.0, 171.6, 175.9, 183.6],
  consumption: [170.9, 176.8, 173.7, 174.6, 182.2, 180.6],
  arabica: [101.3, 94.6, 96.1, 101.1, 101.6, 104.4],
  robusta: [70.0, 73.8, 73.9, 70.5, 74.4, 79.2],
  productionByRegion: {
    "Ásia & Oceania": [49.9, 52.9, 52.8, 47.0, 50.4, 54.6],
    "América do Sul": [82.8, 77.2, 79.5, 85.2, 82.8, 84.1],
    "América Central & México": [19.9, 18.7, 18.7, 17.9, 18.9, 19.9],
    África: [18.7, 19.6, 19.0, 21.5, 23.9, 25.0],
  } as Record<string, number[]>,
  consumptionByRegion: {
    Europa: [52.4, 55.3, 53.5, 52.8, 54.8, 55.1],
    "Ásia & Oceania": [42.6, 44.4, 45.5, 47.6, 48.9, 48.5],
    "América do Norte": [30.2, 31.3, 28.7, 27.8, 30.2, 28.5],
    "América do Sul": [26.9, 27.4, 28.1, 28.2, 28.8, 28.8],
    África: [12.8, 12.4, 11.9, 12.2, 13.3, 13.4],
    "América Central & México": [5.8, 6.0, 6.0, 6.1, 6.2, 6.3],
  } as Record<string, number[]>,
};

/** ICO — preços indicativos de setembro de 2026 (US¢/lb, média mensal). */
export const icoPricesSep2026 = {
  composite: 262.18,
  colombianMilds: 356.15,
  otherMilds: 329.44,
  brazilianNaturals: 290.19,
  robustas: 167.49,
  nyFutures: 280.68,
  londonFutures: 154.28,
};

export const latestYearIndex = 5; // 2026/27
export const currentYearIndex = 4; // 2025/26 (estimativa mais recente consolidada)
