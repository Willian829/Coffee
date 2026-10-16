/**
 * Cafeína por bebida — valores típicos (USDA FoodData Central; EFSA 2015; Mayo Clinic).
 * Há grande variação conforme espécie, dose, moagem e método.
 */
export type CaffeineItem = { id: string; name: string; serving: string; mg: number; range: string; kind: "café" | "outro" };

export const caffeineItems: CaffeineItem[] = [
  { id: "espresso", name: "Espresso", serving: "1 dose (30 ml)", mg: 63, range: "50–80 mg", kind: "café" },
  { id: "duplo", name: "Espresso duplo", serving: "60 ml", mg: 126, range: "100–160 mg", kind: "café" },
  { id: "cafezinho", name: "Cafezinho coado", serving: "50 ml", mg: 30, range: "20–40 mg", kind: "café" },
  { id: "coado", name: "Café coado / filtrado", serving: "240 ml", mg: 95, range: "80–140 mg", kind: "café" },
  { id: "prensa", name: "Prensa francesa", serving: "240 ml", mg: 107, range: "80–135 mg", kind: "café" },
  { id: "cappuccino", name: "Cappuccino / latte", serving: "1 dose de espresso", mg: 63, range: "60–130 mg", kind: "café" },
  { id: "soluvel", name: "Café solúvel", serving: "1 colher (2 g) em 240 ml", mg: 62, range: "30–90 mg", kind: "café" },
  { id: "coldbrew", name: "Cold brew", serving: "240 ml", mg: 155, range: "100–240 mg", kind: "café" },
  { id: "descafeinado", name: "Descafeinado", serving: "240 ml", mg: 2, range: "0–7 mg", kind: "café" },
  { id: "chapreto", name: "Chá preto", serving: "240 ml", mg: 47, range: "25–60 mg", kind: "outro" },
  { id: "chaverde", name: "Chá verde", serving: "240 ml", mg: 28, range: "20–45 mg", kind: "outro" },
  { id: "mate", name: "Chimarrão / mate", serving: "240 ml", mg: 80, range: "40–90 mg", kind: "outro" },
  { id: "cola", name: "Refrigerante de cola", serving: "lata (350 ml)", mg: 34, range: "30–45 mg", kind: "outro" },
  { id: "energetico", name: "Energético", serving: "lata (250 ml)", mg: 80, range: "75–160 mg", kind: "outro" },
  { id: "chocolate", name: "Chocolate 70–85%", serving: "30 g", mg: 23, range: "15–30 mg", kind: "outro" },
];

export const limits = {
  adult: 400, // mg/dia — EFSA 2015 / FDA
  singleDose: 200, // mg — EFSA 2015
  pregnancy: 200, // mg/dia — EFSA 2015
  teenPerKg: 3, // mg/kg/dia — EFSA 2015 (crianças e adolescentes)
  halfLifeHours: 5, // média em adultos saudáveis (faixa ~2–10 h)
};

export const halfLifeFactors = [
  { label: "Adulto típico", hours: 5 },
  { label: "Fumante", hours: 3 },
  { label: "Contraceptivo oral", hours: 9 },
  { label: "Gestação (3º trimestre)", hours: 15 },
];

export type Evidence = {
  outcome: string;
  direction: "menor risco" | "sem efeito claro" | "atenção";
  text: string;
};

export const evidence: Evidence[] = [
  { outcome: "Mortalidade por todas as causas", direction: "menor risco", text: "Revisão guarda-chuva no BMJ (Poole et al., 2017): 3–4 xícaras/dia associadas a risco ~17% menor que não beber." },
  { outcome: "Doenças cardiovasculares", direction: "menor risco", text: "Consumo moderado associado a menor mortalidade cardiovascular (−19%) nas metanálises observacionais." },
  { outcome: "Diabetes tipo 2", direction: "menor risco", text: "Associação dose-dependente consistente, inclusive para o descafeinado — sugerindo papel de outros compostos." },
  { outcome: "Fígado", direction: "menor risco", text: "Menor risco de fibrose, cirrose e câncer de fígado entre consumidores regulares." },
  { outcome: "Parkinson", direction: "menor risco", text: "A cafeína está ligada a menor risco de doença de Parkinson em vários estudos." },
  { outcome: "Hidratação", direction: "sem efeito claro", text: "Em consumidores habituais, quantidades moderadas hidratam de forma semelhante à água (Killer et al., 2014)." },
  { outcome: "Câncer (em geral)", direction: "sem efeito claro", text: "Em 2016, a IARC reclassificou o café como 'não classificável' (grupo 3). Já bebidas muito quentes (> 65 °C) são 'provavelmente carcinogênicas'." },
  { outcome: "Gestação", direction: "atenção", text: "Associações com baixo peso ao nascer e perda gestacional: limite de 200 mg/dia (EFSA)." },
  { outcome: "Sono e ansiedade", direction: "atenção", text: "400 mg tomados 6 h antes de dormir reduziram o sono em mais de 1 hora (Drake et al., 2013)." },
  { outcome: "Colesterol LDL", direction: "atenção", text: "Café sem filtro de papel (prensa, turco, fervido) contém cafestol e kahweol, que elevam o LDL. O papel retém quase tudo." },
];

export const caffeineFacts = [
  { title: "Como age", text: "A cafeína bloqueia os receptores de adenosina, a molécula que sinaliza cansaço ao cérebro. Não cria energia — esconde o sinal de fadiga." },
  { title: "Absorção", text: "Cerca de 99% é absorvida em ~45 minutos; o pico no sangue ocorre entre 15 minutos e 2 horas." },
  { title: "Meia-vida", text: "Em média ~5 horas: metade da cafeína do café das 15h ainda circula às 20h." },
  { title: "Genética", text: "Variantes do gene CYP1A2 tornam algumas pessoas metabolizadoras rápidas e outras lentas." },
  { title: "Robusta × arábica", text: "A robusta tem quase o dobro de cafeína — que, na planta, funciona como pesticida natural." },
  { title: "Dose tóxica", text: "Efeitos tóxicos graves surgem acima de ~1.200 mg ingeridos rapidamente (FDA) — difícil de atingir só com café, fácil com cafeína em pó." },
];
